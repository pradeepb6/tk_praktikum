var mongoose = require('mongoose');
var async = require('async');
var jwt = require('jsonwebtoken');
var config = require('../config');


var RolesModel = require('../models/rolesSchema');
var UserModel = require('../models/userSchema');
var SubmissionModel = require('../models/submissionsSchema');
var ReviewsModel = require('../models/reviewsSchema');


function getUserFromToken(token, callback){
    jwt.verify(token, config.secret, function(err, decoded){
        if(!err){
            callback(null, decoded._doc);

        }else{
            callback(err, null);
        }
    });
}

// Gets user along with roles object instead of just roles_id
function getUser(user_id, callback) {
    UserModel.findOne({ _id: user_id }).lean().exec(function (err, user) {
        if (err) {
            callback(err, null);
        } else {
            RolesModel.find({ _id: { $in: user.roles } }, function (err, roles) {
                if (err) {
                    callback(err, null);
                } else {
                    user.roles = roles;
                    callback(err, user);
                }
            });
        }
    });
}

// Get full user detail including role obj, submissions, reviews
function getFullUserDetail(user_id, callback){
    getUser(user_id, function(err, user){
        getSubmissions(user_id, function(err, submissions){
            user.submissions = submissions;
            getReviews(user_id, function(err, reviews){
                user.reviews = reviews;
                callback(err, user);
            });
        });
    });
}


// Get users along with roles object instead of just roles_id
function getUsers(callback) {
    UserModel.find(function (err, users) {
        if (err) {
            callback(err, null);
        } else {
            async.each(users,
                function (user, cb) {
                    RolesModel.find({ _id: { $in: user.roles } }, function (err, roles) {
                        if (err) return console.log("Error while getting roles for user");
                        user.roles = roles;
                        // callback function to notify async that it is finished
                        cb();
                    });
                }, function (err) {
                    // call the main callback when everything is done
                    callback(err, users);
                });
        }
    });
}

// Get submissions made by the given user
function getSubmissions(user_id, callback) {
    SubmissionModel.find({ user_id: user_id }).lean().exec(function (err, submissions) {
        if (err) {
            callback(err, null);
        } else {
            callback(err, submissions);
        }
    });
}

// Get all submissions
function getAllSubmissions(callback) {
    SubmissionModel.find({}).lean().exec(function (err, submissions) {
        if (err) {
            callback(err, null);
        } else {
            callback(err, submissions);
        }
    });
}

// Get all submissions with user details
function getAllSubmissionsWithDetails(callback){
    getAllSubmissions(function(err, submissions){
        async.each(submissions,
            function(submission, callback_asy){
                getUser(submission.main_author, function(err, user){
                    submission.author = user;
                    callback_asy();
                });

            }, function(err){
                // when everything is done
                callback(err, submissions);
            }
        )
    });
}

// Get reviews made by the given user
function getReviews(user_id, callback) {
    ReviewsModel.find({ user_id: user_id }).lean().exec(function (err, submissions) {
        if (err) {
            callback(err, null);
        } else {
            callback(err, submissions);
        }
    });
}

// Get reviews made by the given user
function getCoAuthors(submission_id, callback) {
    SubmissionModel.findOne({_id: submission_id}).lean().exec(function (err, submission) {
        if (err) {
            callback(err, null);
        } else {
            callback(err, submission);
        }
    });
}

// Get all reviews
function getAllReviews(callback) {
    ReviewsModel.find({}).lean().exec(function (err, submissions) {
        if (err) {
            callback(err, null);
        } else {
            callback(err, submissions);
        }
    });
}


// Get reviews  made by the given user along with submission detail
function getReviewsWithSubmissionDetail(user_id, callback) {
    getReviews(user_id, function (err, reviews) {
        async.each(reviews,
            function (review, callback_asy) {
                SubmissionModel.findOne({ _id: review.submission_id }, function (err, submission) {
                    review.for_submission = submission;
                    callback_asy();
                });
            }, function (err) {
                // when everything is done
                callback(err, reviews);
            });
    });
}


// Get all the reviews along with user object instead of user_id
function getReviewsForSubmission(submission_id, callback){
    ReviewsModel.find({submission_id: submission_id}).lean().exec(function(err, reviews){
        async.each(reviews,
        function(review, callback_async){
            // for the review, get the details of user
            getUser(review.user_id, function(err, user){
                review.user = user;
                callback_async();
            })
        }, function(err){
            callback(err, reviews);
        });
    });
}

module.exports.getUserFromToken = getUserFromToken;
module.exports.getUsers = getUsers;
module.exports.getUser = getUser
module.exports.getReviews = getReviews;
module.exports.getAllReviews = getAllReviews;
module.exports.getSubmissions = getSubmissions;
module.exports.getAllSubmissions = getAllSubmissions;
module.exports.getAllSubmissionsWithDetails = getAllSubmissionsWithDetails;
module.exports.getReviewsWithSubmissionDetail = getReviewsWithSubmissionDetail;
module.exports.getReviewsForSubmission = getReviewsForSubmission;
