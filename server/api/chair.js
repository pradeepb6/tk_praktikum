// require npm modules
var express = require('express');
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
var async = require('async');
var mongoose = require('mongoose');

// require our modules
var config = require('../config');
var emailHelper = require('../helpers/email_helper');
var roleHelper = require('../helpers/role_helper');
var userHelper = require('../helpers/user_helper');

// require schema
var UserModel = require('../models/userSchema');
var RolesModel = require('../models/rolesSchema');
var ConferenceModel = require('../models/conferenceSchema');
var ReviewsModel = require('../models/reviewsSchema');
var SubmissionModel = require('../models/submissionsSchema');

// get an instance of the router for public api routes
var apiRoutes = express.Router();


//route middleware to verify token and role
apiRoutes.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token' });
            } else {
                // now check if the role of loggedin user is chair
                roleHelper.isChair(token, function (isChair) {
                    isChair = true; //remove this later
                    if (isChair == true) {
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


// Updating conference details
apiRoutes.post('/conf', function (req, res) {
    ConferenceModel.update({ 'id': 1 }, req.body.conference, { upsert: true, setDefaultOnInsert: true }, function (err) {
        if (err) {
            res.json({ success: false, message: 'Error in Saving Conference.' });
        }
        res.json({ success: true, message: 'Saving Conference was successful' });

    });

});


// Get a list of all reviews
apiRoutes.get('/reviews', function (req, res) {
    ReviewsModel.find(function (err, reviews) {
        res.send(reviews);
    });
});

apiRoutes.get('/review/submission/id/:id', function(req, res){
    userHelper.getReviewsForSubmission(req.params.id, function(err, reviews){
        res.json(reviews);
    });
});

// Assign papers to review for a given user
apiRoutes.post('/assignreviewsforuser', function (req, res) {
    // first remove all reviews for the user
    ReviewsModel.find({ user_id: req.body.user_id }).remove(function () {
        // now add the submissions
        async.each(req.body.submission_ids,
            function (submission_id, callback) {
                SubmissionModel.findOne({_id : submission_id}, function(err, submission){
                    //create a new review
                    review = new ReviewsModel({
                        user_id: req.body.user_id,
                        submission_id: submission._id,
                        paper_title: submission.title
                    });
                    review.save(function (err) {
                        callback();
                    });
                });


            }, function (err) {
                res.json({ success: true, message: "Reviews successfully assigned" });
            }
        );
    });
});


// Get the list of all submissions.
apiRoutes.get('/submissions', function (req, res) {
    userHelper.getAllSubmissionsWithDetails(function (err, submissions) {
        res.send(submissions);
    })
});

// // Get the list of all coauthors for a given submission.
apiRoutes.get('/get/coauthors/:submission_id', function (req, res) {
    console.log(req.params.submission_id);
    SubmissionModel.findOne({_id: req.params.submission_id},function (err, submission) {
        if (err) console.log(err);
        UserModel.find({_id: { $in : submission.co_authors}}, function (err, users) {
            res.send(users);
        })
    });
});

// change the status for a given submission
apiRoutes.post('/submission/status/:id', function (req, res) {
    SubmissionModel.findOneAndUpdate({_id: req.params.id}, {$set:{status:req.body.status, last_modified_by: req.body.modified_user}}, { new: true },function (err, submission) {
        if (err) console.log(err);
        UserModel.findOne({_id: submission.main_author}, function (err, user) {
            sendMailToMainAuthor(user.email, req.body.status);
            res.send(submission);
        })
    });
});

// change the status to 'accepted' for all submissions with status 'complete'
apiRoutes.post('/submission/status/change/all', function (req, res) {
    SubmissionModel.update({status: 'complete'}, {$set:{status:'accepted', last_modified_by: req.body.modified_user}}, { multi: true }, function (err, submissions) {
        var emails = [];
        async.each(submissions, function (submission, callback) {
            UserModel.findOne({_id: submission.main_author}, function (err, user) {
                if(user)
                    emails.push(user.email);
                callback();
            })
        }, function (err) {
            for(var i=0; i < emails.length; i++){
                sendMailToMainAuthor(emails[i], 'Accepted');
            }
        });
        if (err) res.json({ success: false, message: "Error changing the status!" });
        res.json({ success: true, message: "Changed status successfully!" });
    });
});

var sendMailToMainAuthor = function (email, status) {
    var subject = "Status Change!";
    var message = 'Status of your submission is changed to '+ status +' by chair!!';
    emailHelper.sendEmail(email, subject, message);
};


// change api endpoint to nice name
apiRoutes.get('/submissionsdetails', function (req, res) {
    // use lean() to add new property
    SubmissionModel.find({ status: 'accepted' }).lean().exec(function (err, submissions) {
        if (err) console.log(err);
        async.each(submissions,
            function (submission, callback) {
                // submission = submission.toObject();
                ReviewsModel.count({ submission_id: submission._id}, function (err, count) {
                    submission.count = count;
                    callback();
                });
            }, function (err) {
                // send the response when everything is done
                res.send(submissions);
            });
    })
});

apiRoutes.get('/users', function (req, res) {
    userHelper.getUsers(function (err, users) {
        if (err) return console.log("Error while getting users");
        res.json(users);
    });
});

apiRoutes.get('/reviewers', function (req, res) {
    roleHelper.isChair(req.headers.token, function (isChair) {
        isChair = true;
        if (isChair == false) {
            console.log("You are not a chair you fool!");
            return res.status(401).send("Unauthorized request");
        } else {
            //    is it reviewer or author?????
            RolesModel.findOne({ role: 'reviewer' }, function (err, role) {
                if (err) return res.status(500).send("Error getting data of reviewers");
                UserModel.find({ roles: role._id }).lean().exec(function (err, reviewers) {
                    if (err) return res.status(500).send("Error getting reviewers from user table");
                    // get assigned submissions for each reviewers
                    async.each(reviewers,
                        function (reviewer, callback) {
                            ReviewsModel.find({ user_id: reviewer._id }, { submission_id: 1 }, function (err, reviews) {
                                var submission_ids = [];
                                for (var i = 0; i < reviews.length; i++) {
                                    submission_ids.push(reviews[i].submission_id);
                                }
                                // now find the actual submissions (only the title and _id)
                                SubmissionModel.find({ _id: { $in: submission_ids } }, { title: 1 }, function (err, submissions) {
                                    reviewer.assigned_submissions = submissions;
                                    callback();
                                });
                            });
                        }, function (err) {
                            // send the response when everything is done
                            res.json(reviewers);
                        });
                });
            });
        }
    });

});

// get list of name and id of reviewers
apiRoutes.get('/reviewers/all', function (req, res) {
    roleHelper.isChair(req.headers.token, function (isChair) {
        isChair = true;
        if (isChair == false) {
            console.log("You are not a chair you fool!");
            return res.status(401).send("Unauthorized request");
        } else {
            RolesModel.findOne({ role: 'reviewer' }, function (err, role) {
                if (err) return res.status(500).send("Error getting data of reviewers");
                UserModel.find({ roles: role._id }).lean().exec(function (err, reviewers) {
                    if (err) return res.status(500).send("Error getting reviewers from user table");
                    res.send(reviewers);
                });
            });
        }
    });

});

apiRoutes.get('/authors/all', function (req, res) {
    roleHelper.isChair(req.headers.token, function (isChair) {
        isChair = true;
        if (isChair == false) {
            console.log("You are not a chair you fool!");
            return res.status(401).send("Unauthorized request");
        } else {
            RolesModel.findOne({ role: 'author' }, function (err, role) {
                if (err) return res.status(500).send("Error getting data of authors");
                UserModel.find({ roles: role._id }).lean().exec(function (err, authors) {
                    if (err) return res.status(500).send("Error getting authors from user table");
                    res.send(authors);
                });
            });
        }
    });

});

// Get submission give submission_id
apiRoutes.get('/submission/id/:id', function(req, res){
    SubmissionModel.findOne({_id : req.params.id}, function(err, submission){
        res.json(submission);
    });
});

// Get the submission(s) made by the given user
apiRoutes.get('/user/submissions/:userId', function (req, res) {
    SubmissionModel.find({ $or: [{main_author: mongoose.Types.ObjectId(req.params.userId)}, {co_authors: mongoose.Types.ObjectId(req.params.userId)}] }, function (err, submissions) {
        res.json(submissions);
    });
});

// Get the reviews(s) made by the given user
apiRoutes.get('/review/:userId', function (req, res) {
    ReviewsModel.find({ user_id: req.params.userId }, function (err, review) {
        res.json(review);
    });
});

// Get the reviews(s) made by the given user for the given submission
apiRoutes.get('/review/:userId/:submissionId', function (req, res) {
    ReviewsModel.findOne({ user_id: req.params.userId, submission_id: req.params.submissionId }, function (err, review) {
        res.json(review);
    });
});

// Get statistics about submissions by institution
apiRoutes.get('/statistics/submission/institution', function (req, res) {
    userHelper.getAllSubmissionsWithDetails(function (err, submissions) {
        var countMap = {};
        for (var i = 0; i < submissions.length; i++) {
            var submission = submissions[i];
            if (countMap.hasOwnProperty(submission.author.institution)) {
                countMap[submission.author.institution] += 1;
            } else {
                countMap[submission.author.institution] = 1;
            }
        }
        var output = [];
        var keys = Object.keys(countMap);
        for(var i = 0; i < keys.length; i++){
            output.push({key: keys[i], value : countMap[keys[i]]});
        }
        res.json(output);
    });
});

// Get statistics about submissions by country
apiRoutes.get('/statistics/submission/country', function (req, res) {
    userHelper.getAllSubmissionsWithDetails(function (err, submissions) {
        var countMap = {};
        for (var i = 0; i < submissions.length; i++) {
            var submission = submissions[i];
            if (countMap.hasOwnProperty(submission.author.country)) {
                countMap[submission.author.country] += 1;
            } else {
                countMap[submission.author.country] = 1;
            }
        }
        var output = [];
        var keys = Object.keys(countMap);
        for(var i = 0; i < keys.length; i++){
            output.push({key: keys[i], value : countMap[keys[i]]});
        }
        res.json(output);
    });
});

// Get statistics about keywords count
apiRoutes.get('/statistics/keywords/count', function (req, res) {
    userHelper.getAllSubmissions(function (err, submissions) {
        var keywordCountMap = {}
        for (var i = 0; i < submissions.length; i++) {
            var submission = submissions[i];
            for (var j = 0; j < submission.keywords.length; j++) {
                var keyword = submission.keywords[j];
                if (keywordCountMap.hasOwnProperty(keyword)) {
                    keywordCountMap[keyword] += 1;
                } else {
                    keywordCountMap[keyword] = 1;
                }
            }
        }
        var output = [];
        var keys = Object.keys(keywordCountMap);
        for(var i = 0; i < keys.length; i++){
            output.push({key: keys[i], value : keywordCountMap[keys[i]]});
        }
        res.json(output.sort(function(obj1, obj2){
            return obj2.value - obj1.value
        }).slice(0, 10));
    });
});

// Get statistics about user roles
apiRoutes.get('/statistics/users/count', function(req, res){
    var chairs = 0, reviewers = 0, authors = 0;
    userHelper.getUsers(function(err, users){
        for(var i = 0; i < users.length; i++){
            var user = users[i];
            for(var j = 0; j < user.roles.length; j++){
                var role = user.roles[j].role;
                if(role == 'author'){
                    authors += 1;
                }else if(role == 'chair'){
                    chairs += 1;
                }else if(role == 'reviewer'){
                    reviewers += 1;
                }
            }
        }
     res.json([{key: 'Chair', value: chairs}, {key: 'Author', value: authors}, {key: 'Reviewer', value: reviewers}]);   
    });
});

// Get statistics about submission status
apiRoutes.get('/statistics/submissionstatus/count', function(req, res){
    SubmissionModel.aggregate({$group: {_id: '$status', count: {$sum: 1}}}, function(err, agg){
        res.json(agg);
    });
});

apiRoutes.get('/statistics/review/evaluation', function(req, res){
    ReviewsModel.aggregate({$group: {_id: '$overall_evaluation', count: {$sum: 1}}}, function(err, agg){
        output = [];
        for(var i = 0; i < agg.length; i++){
            if(agg[i]._id){
                output.push(agg[i]);
            }
        }
        res.json(output);
    });
});

apiRoutes.get('/statistics/review/expertise', function(req, res){
    ReviewsModel.aggregate({$group: {_id: '$expertise', count: {$sum: 1}}}, function(err, agg){
        output = [];
        for(var i = 0; i < agg.length; i++){
            if(agg[i]._id){
                output.push(agg[i]);
            }
        }
        res.json(output);
    });
});

// This method will return review dates
apiRoutes.get('conference/dates', function (req, res) {
    ConferenceModel.findOne({}, function (err, conference) {
        res.json(conference);
    });
});

module.exports = apiRoutes;