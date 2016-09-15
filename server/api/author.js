    // require npm modules
var express = require('express');
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
var multer = require('multer');
var crypto = require('crypto');
var async = require('async');
var path = require('path');
var mongoose = require('mongoose');

// require our modules
var config = require('../config');
var emailHelper = require('../helpers/email_helper');
var roleHelper = require('../helpers/role_helper');
var userHelper = require('../helpers/user_helper');

// require schema
var UserModel = require('../models/userSchema');
var SubmissionModel = require('../models/submissionsSchema');
var RolesModel = require('../models/rolesSchema');

// get an instance of the router for public api routes
var apiRoutes = express.Router();

// store parent directory
var __parentDir = path.dirname(module.parent.filename);

function GenerateToken() {
    return {token: crypto.randomBytes(20).toString('hex')};
}

//route middleware to verify token and role
apiRoutes.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token'});
            } else {
                // now check if the role of loggedin user is author
                roleHelper.isAuthor(token, function (isAuthor) {
                    isAuthor = true; // remove this later
                    if (isAuthor == true) {
                        // if everything is good, save to request for use in other routes
                        req.decoded = decoded;
                        next();
                    } else {
                        return res.status(403).send({success: false, message: "Unauthorized access"});
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


//multer storage path for uploaded files
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname + '.pdf');
    }
});

var upload = multer({storage: storage}).single('file');

// submission function
apiRoutes.post('/uploads', function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            return res.json({success: false, message: "Error uploading file."});
        } else {
            var coauthor_ids = [];
            // Check co authors and create user for them if they don't exist already
            async.each(req.body.submissionDetails.co_authors
                , function (coauthor, callback_asy) {
                    UserModel.findOne({email: coauthor.email}, function (err, user) {
                        // user already exists so get the id
                        if (user) {
                            coauthor_ids.push(user._id);
                            callback_asy();
                        } else {
                            RolesModel.findOne({'role': 'author'}, function (err, role) {
                                var tokenGenerated = new GenerateToken();
                                var usr = new UserModel({
                                    first_name: coauthor.fname,
                                    last_name: coauthor.lname,
                                    email: coauthor.email,
                                    verified: false,
                                    created_by: 'system',
                                    registered_on: new Date(),
                                    confirm_token: tokenGenerated.token,
                                    password: randomstring.generate(10),
                                    roles: [role._id]
                                });

                                usr.save(function (err) {
                                    if (err) {
                                        console.log("Error while creating coauthor", err);
                                    } else {
                                        console.log("Created new user for coauthor");
                                        console.log(usr._id);
                                        coauthor_ids.push(usr._id);
                                    }
                                    callback_asy();
                                });
                            });

                        }
                    });

                },
                function (err) {
                    // get the _id of current user
                    userHelper.getUserFromToken(req.headers.token, function (err, user) {
                        var submission = {};
                        if (req.body.submissionDetails._id) {
                            req.body.submissionDetails.co_authors = coauthor_ids;
                            SubmissionModel.findOneAndUpdate({_id: req.body.submissionDetails._id},
                                req.body.submissionDetails, {upsert: true}, function (err, sub) {
                                    if (err) {
                                        res.json({success: false, message: 'Error during submission.'});
                                    } else {
                                        if(coauthor_ids.length > 0)
                                            sendMailToCoAuthors(user, coauthor_ids);
                                        res.json({success: true, message: 'Successfully Saved.'});
                                    }
                                });
                        } else {
                            submission = new SubmissionModel({
                                title: req.body.submissionDetails.title,
                                abstract: req.body.submissionDetails.abstract,
                                keywords: req.body.submissionDetails.keywords,
                                co_authors: coauthor_ids,
                                main_author: user._id,
                                status: req.body.submissionDetails.status,
                                date_submitted: new Date(),
                                pdf_location: req.body.submissionDetails.pdf_location
                            });
                            submission.save(function (err) {
                                if (err) {
                                    res.json({success: false, message: 'Error during submission.'});
                                } else {
                                    sendMailToMainAuthor(user.email);
                                    if(coauthor_ids.length > 0)
                                        sendMailToCoAuthors(user, coauthor_ids);
                                    res.json({success: true, message: 'Successfully Submitted.'});
                                }
                            });
                        }

                    });
                });

        }

    });

});

var sendMailToMainAuthor = function (main_author) {
    var subject = "Submission successful!";
    var message = 'Congratulations!! You have successfully submitted the paper!!';
    emailHelper.sendEmail(main_author, subject, message);
};

var sendMailToCoAuthors = function (user, coauthor_ids) {
    var message = '';
    var main_author_name = user.first_name + ' '+ user.last_name;
    var pwd = randomstring.generate(10);
    var subject = "Submission successful!";
    for(var i=0; i< coauthor_ids.length; i++){
        UserModel.findOne({_id: coauthor_ids[i]}, function (err, user) {
            if(user.verified != true){
                user.password = pwd;
                user.save(function (err) {
                    if (err) {
                        res.json({ success: false, message: 'Unable to save password.' });
                    }});
                message = main_author_name +' has added you as a co-author for paper submission. ' +
                    'Please click the below link to confirm your email!' +
                    ' \n http://localhost:3000/emailConfirm/' + user.confirm_token +
                    '\n After the confirmation please visit http://localhost:3000/ to know more. ' +
                    '\n Your password is '+ pwd;
            }
            else{
                message = 'Some one added you as a co-author for their submission. ' +
                    'Please visit http://localhost:3000/ to know more!!';

            }
            emailHelper.sendEmail(user.email, subject, message);
        });
    }
};

// withdraw a submission
apiRoutes.post('/submission/status/:id', function (req, res) {
    SubmissionModel.findOneAndUpdate({_id: req.params.id}, {$set:{status:req.body.status, last_modified_by: req.body.modified_user}}, { new: true },function (err, submission) {
        if (err) console.log(err);
        res.send(submission);
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


// Get the submission made by paper id
apiRoutes.get('/submission/:id', function (req, res) {
    SubmissionModel.findOne({_id: req.params.id}, function (err, submission) {
        res.send(submission);
    });
});


// Get all the submissions (co-authored as well) done by a user
/***
 * @param userId
 *
 * @return submissions
 */
apiRoutes.get('/get/submissions/:userId', function (req, res) {
    SubmissionModel.find({ $or: [{main_author: mongoose.Types.ObjectId(req.params.userId)}, {co_authors: mongoose.Types.ObjectId(req.params.userId)}] }, function (err, submissions) {
        res.json(submissions);
    });
});
module.exports = apiRoutes;