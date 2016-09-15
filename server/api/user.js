// require npm modules
var express = require('express');
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");

// require our modules
var config = require('../config');

// require schema
var UserModel = require('../models/userSchema');
var submissionsModel = require('../models/submissionsSchema');
var reviewsModel = require('../models/reviewsSchema');
var RolesModel = require('../models/rolesSchema');


// get an instance of the router for public api routes
var apiRoutes = express.Router();


//route middleware to verify token
apiRoutes.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['token'];
    if (token) {
        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
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

//Save User
apiRoutes.post('/save/:id', function (req, res) {
    var query = { '_id': req.params.id };
    req.body.userDetails.last_login = new Date();
    delete req.body.userDetails.roles;
    UserModel.findOneAndUpdate(query, req.body.userDetails, function (err, doc) {
        if (err) return res.status(503).send("Error saving the Data");
        res.json({ success: true, message: 'Successfully saved' });
    });
});


// Get user
apiRoutes.get('/get/:id', function (req, res) {
    UserModel.findOne({ _id: req.params.id }, function (err, user) {
        if (err) return console.error(err);
        res.send(user);
    });
});

// Get user Roles by UserID
apiRoutes.get('/roles/get/:id', function (req, res) {
    UserModel.findOne({ _id: req.params.id }, function (err, user) {
        if (err) return console.error(err);
        RolesModel.find({_id: {$in: user.roles}}, function (err, roles) {
            if (err) return console.log("Error while getting roles for user");
            res.send(roles);
        });
    });
});

//get user details by userID
apiRoutes.get('/get/id/:id', function (req, res) {
    UserModel.findOne({ _id: req.params.id }, function (err, user) {
        if (err) return console.error(err);
        res.send(user);
    });
});

apiRoutes.post('/password/change', function (req, res) {
    var query = { 'email': req.body.email };
    UserModel.findOne({ email: req.body.email }, function (err, user) {
        if (err) throw err;
        if (!user) {
            res.json({ success: false, message: 'Email not found in the database' });
        } else {
            user.password = req.body.password;
            user.save(function (err) {
                if (err)
                    res.json({ success: false, message: 'Unable to reset password. Please contact admin' });
                res.json({ success: true, message: 'Successfully saved' });
            })
        }
    })
});

apiRoutes.post('/updateLastLogin/:email', function (req, res) {
    var query = { 'email': req.params.email };
    UserModel.update(query, { last_login: new Date() }, { upsert: true }, function (err, doc) {
        if (err) return res.status(503).send("Error saving the Data");
        res.json({ success: true, message: 'Successfully saved' });
    });
});

apiRoutes.post('/deleteAccount', function (req, res) {
    UserModel.findOne({email: req.body.email}, function (err, user) {
        if (err) throw err;
        if (user) {
            //check password
            user.comparePassword(req.body.password, function (isMatch) {
                if (!isMatch) {
                    res.json({success: false, message: 'Password is not correct'});
                    // return res.send(401);
                }
                else {
                    submissionsModel.remove({main_author: user._id}, function() {
                        // removed.
                    });
                    reviewsModel.remove({main_author: user._id}, function() {
                        // removed.
                    });
                    user.remove();
                    res.json({success: true, message: 'Your data is successfully deleted!'});
                }
            });
        }
    });
});

// Get the list of coauthors
apiRoutes.get('/coauthors/submission/:ids', function (req, res) {
    UserModel.find({_id: {$in: req.params.ids}}, function (err, users) {
        res.send(users);
    });
});

module.exports = apiRoutes;