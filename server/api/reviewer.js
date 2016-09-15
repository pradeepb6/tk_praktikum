// require npm modules
var express = require('express');
var async = require('async');
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
var mongoose = require("mongoose");
var path = require("path");

// require our modules
var config = require('../config');
var emailHelper = require('../helpers/email_helper');
var roleHelper = require('../helpers/role_helper');
var userHelper = require('../helpers/user_helper');

// require schema
var UserModel = require('../models/userSchema');
var ReviewsModel = require('../models/reviewsSchema');
var SubmissionModel = require('../models/submissionsSchema');

// get an instance of the router for public api routes
var apiRoutes = express.Router();


var __parentDir = path.dirname(module.parent.filename);

//route middleware to verify token and role
apiRoutes.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token' });
            } else {
                // now check if the role of loggedin user is reviewer
                roleHelper.isReviewer(token, function (isReviewer) {
                    isReviewer = true; //remove this later
                    if (isReviewer == true) {
                        // if everything is good, save to request for use in other routes
                        req.decoded = decoded;
                        next();
                    } else {
                        return res.status(403).send({ success: false, message: "Unauthorized access" });
                    }
                })

            }
        });
    } else {
        // if there is no token return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
});


/***
 * Save review for a submission
 * @param review object
 *
 */
apiRoutes.post('/review/', function (req, res) {
    var review = new ReviewsModel({
        expertise: req.body.reviewData.expertise,
        overall_evaluation: req.body.reviewData.overall_evaluation,
        summary: req.body.reviewData.summary,
        major_strong_points: req.body.reviewData.major_strong_points,
        weak_points: req.body.reviewData.weak_points,
        detailed_comments: req.body.reviewData.detailed_comments,
        user_id: req.body.reviewData.user_id,
        submission_id: req.body.reviewData.submission_id,
        reviewed_date: new Date()
    });

    var review = req.body.reviewData;
    review.reviewed_date = new Date();
    ReviewsModel.findOneAndUpdate({_id: req.body.reviewData._id}, review, { upsert: true }, function (err, review) {
        if (err) return res.status(503).send("Error saving the Data");
        SubmissionModel.findOne({_id: review.submission_id}, function (err, submission) {
            if(err) console.log("error get submission with user");
            UserModel.findOne({_id: submission.main_author}, function (err, user) {
                submission.author = user;
                sendMailToMainAuthor(submission);
            });
        });
        res.json({ success: true, message: 'Successfully saved' });
    });
});

var sendMailToMainAuthor = function (submission) {
    var subject = "Received Review!";
    var message = 'Hello!! you have received review for the paper \''+submission.title +' \' !!';
    emailHelper.sendEmail(submission.author.email, subject, message);
};

//TODO: get submissions done by co-author when the user login
/***
 * Get all the submissions done by a user
 * @param userId
 *
 * @return submissions
 */
apiRoutes.get('/get/reviews/:id', function (req, res) {
    ReviewsModel.find({ user_id: req.params.id }, function (err, submissions) {
        if (err) return console.error(err);
        res.send(submissions);
    });
});

/***
 * Get individual review
 * @param reviewId
 *
 * @return review object
 */
apiRoutes.get('/review/:id/:userId', function (req, res) {
    ReviewsModel.findOne({ _id: req.params.id, user_id: req.params.userId }, function (err, review) {
        if (err) return console.error(err);
        res.send(review);
    });
});


apiRoutes.get('/assigned_submissions/:userId', function (req, res) {

    ReviewsModel.find({ user_id: req.params.userId }).lean().exec(function (err, reviews) {
        if (err) return res.status(500).send("Error getting reviewers from user table");
        // get assigned submissions for each reviewers
        async.each(reviews,
            function (review, callback) {
                SubmissionModel.findOne({ _id: review.submission_id }, function (err, submission) {
                    review.submission_details = submission;
                    callback();
                });


            }, function (err) {
                // send the response when everything is done
                res.json(reviews);
            });
    });

});

apiRoutes.get('/get/reviews/author/:userId', function (req, res) {
    var reviews = [];
    SubmissionModel.find({ $or: [{main_author: mongoose.Types.ObjectId(req.params.userId)}, {co_authors: mongoose.Types.ObjectId(req.params.userId)}] }, function (err, submissions) {
        async.each(submissions,
            function (submission, callback) {
                ReviewsModel.find({ submission_id: submission._id }, function (err, review) {
                        review.user_id = '';
                        reviews.push(review);
                        callback();
                });
            }, function (err) {
                // send the response when everything is done
                res.send(reviews);
            });
    });
});

apiRoutes.get('/download/:id', function (req, res) {
    var file = __parentDir +'/uploads/' + req.params.id + '.pdf';
    var options = {
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true,
            'Content-Disposition': 'inline'
        }
    };

    res.contentType('application/pdf');
    res.sendFile(file, options);
});


module.exports = apiRoutes;