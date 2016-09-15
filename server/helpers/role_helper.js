var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('../config');

var RolesModel = require('../models/rolesSchema');

// Returns list of roles of the user having this token
function getRoles(token, callback){
    jwt.verify(token, config.secret, function(err, decoded){
        if(!err){
            RolesModel.find({_id: {$in : decoded._doc.roles}}, function(err, roles){
                rolesArray = [];
                for (var index = 0; index < roles.length; index++) {
                    rolesArray.push(roles[index].role);
                }
                callback(rolesArray);
            });
        }else{
            callback([]);
        }
    });
}

// Check whether the user having this token has the given role
function hasRole(token, role, callback){
    getRoles(token, function(roles){
        callback(roles.indexOf(role) > -1);
    })
};

// Check whether the user having this token is chair
function isChair(token, callback){
    hasRole(token, 'chair', callback);
}

// Check whether the user having this token is reviewer
function isReviewer(token, callback){
    hasRole(token, 'reviewer', callback);
}

// Check whether the user having this token is author
function isAuthor(token, callback){
    hasRole(token, 'author', callback);
}

module.exports.getRoles = getRoles;
module.exports.hasRole = hasRole;
module.exports.isChair = isChair;
module.exports.isReviewer = isReviewer;
module.exports.isAuthor = isAuthor;