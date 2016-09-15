// require npm modules
var express = require('express');
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
var crypto = require('crypto');

// require our modules
var emailHelper = require('../helpers/email_helper');
var config = require('../config');

// require schema
var UserModel = require('../models/userSchema');
var RolesModel = require('../models/rolesSchema');
var ConferenceModel = require('../models/conferenceSchema');


// get an instance of the router for public api routes
var apiRoutes = express.Router();

var datetime = new Date();

function GenerateToken() {
    return { token: crypto.randomBytes(20).toString('hex') };
}

//user authentication api
apiRoutes.post('/signin', function (req, res) {
    // console.log(req.body, req.params, req.query);
    //find user
    UserModel.findOne({ email: req.body.email }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found' });
        } else if (user) {
            //check password
            user.comparePassword(req.body.password, function (isMatch) {
                if (!isMatch) {
                    console.log("Attempt failed to login with " + user.email);
                    res.json({ success: false, message: 'Authentication failed. Check your Credentials' });
                    // return res.send(401);
                } else {
                    if (user.verified == false) {
                        res.json({ success: false, message: 'Your email is not verified' });
                    }
                    else {
                        //if user is found and password is right
                        var token = jwt.sign(user, config.secret);

                        //remove password from user object before sending
                        //didn't work so just set blank
                        user.password = '';

                        // find the actual role object rather than just _id
                        RolesModel.find({ _id: { $in: user.roles } }, function (err, roles) {
                            if (err) return console.log("Error while getting roles for user");
                            user.roles = roles;

                            //return the infor including token as json
                            res.json({
                                success: true,
                                message: 'Successfully logged in',
                                token: token,
                                user: user
                            });
                        });
                    }
                }
            });
        }
    });
});
//end user authentication api

apiRoutes.post('/signup', function (req, res) {
    UserModel.findOne({ email: req.body.email }, function (err, user) {
        var author_role_id = '';
        // get id of role author
        RolesModel.findOne({ 'role': 'author' }, function (err, role) {
            author_role_id = role._id;
        });
        var review_role_id = '';
        // get id of role author
        RolesModel.findOne({ 'role': 'reviewer' }, function (err, role) {
            review_role_id = role._id;
        });
        if (err) throw err;
        if (!user) {
            var user_role = [];
            RolesModel.find({}, function (err, roles) {
                if(req.body.role_choice.localeCompare('1') == 0){
                    user_role = author_role_id;
                }
                else if(req.body.role_choice.localeCompare('2') == 0) {
                    user_role = review_role_id;
                }
                else if(req.body.role_choice.localeCompare('3') == 0) {
                    user_role = [author_role_id, review_role_id];
                }
                var tokenGenerated = new GenerateToken();
                user = new UserModel({
                    email: req.body.email,
                    password: req.body.password,
                    registered_on: datetime,
                    salutation: 'select',
                    confirm_token: tokenGenerated.token,
                    verified: false,
                    roles: user_role
                });

                user.save(function (err) {
                    if (err) {
                        res.json({ success: false, message: 'Error in user registration.' });
                        console.log(err);
                    }
                    var message = 'You have been successfully registered. \n\n Please click the below link to confirm your email!' +
                        ' \n http://localhost:3000/emailConfirm/' + tokenGenerated.token;
                    var subject = "Successful Registration";
                    emailHelper.sendEmail(req.body.email, subject, message);
                    res.json({ success: true, message: 'User is successfully registered.' });
                });

            });

        } else if (user) {
            // Check if the already existing user is a system generated user. If yes then update the record
            // and send further instructions via email
            if (user.created_by == 'system') {
                user.password = req.body.password;
                user.created_by = 'user';
                user.save(function (err) {
                    if (err) {
                        res.json({ success: false, message: 'Error in user registration.' });
                        console.log(err);
                    }
                    var message = 'You have been successfully registered. \n\n Please click the below link to confirm your email!' +
                        ' \n http://localhost:3000/emailConfirm/' + user.confirm_token;
                    var subject = "Successful Registration";
                    emailHelper.sendEmail(req.body.email, subject, message);
                    res.json({ success: true, message: 'User is successfully registered.' });
                });
            } else {
                res.json({ success: false, message: 'This Email id is already taken.' });
            }
        }
    });
});


// reset password 
apiRoutes.post('/resetemail', function (req, res) {
    UserModel.findOne({ email: req.body.email }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: false, message: 'Email not found in the database' });
        } else {
            //generate a new password and save it
            var pwd = randomstring.generate(10);
            user.password = pwd;
            user.save(function (err) {
                if (err) {
                    res.json({ success: false, message: 'Unable to reset password. Please contact admin' });
                }
                // send email to user
                var message = "Your new password is: " + pwd + "\nPlease login and change the password.";
                emailHelper.sendEmail(user.email, "Password Reset", message);
                res.json({ success: true, message: "Check you email for further instructions." });
            })
        }
    })
});

apiRoutes.get('/conf', function (req, res) {
    ConferenceModel.findOne({ id: 1 }, function (err, confs) {
        if (err) return console.error(err);
        res.send(confs);
    });
});


apiRoutes.get('/roles/get', function (req, res) {
    RolesModel.find({}, function (err, roles) {
        res.send(JSON.stringify(roles));
    });
});


module.exports = apiRoutes;