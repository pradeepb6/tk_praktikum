var async = require('async');
var config = require('../config');


var RolesModel = require('../models/rolesSchema');
var UserModel = require('../models/userSchema');
var SubmissionModel = require('../models/submissionsSchema');
var ReviewsModel = require('../models/reviewsSchema');



function getSubmissionCountStatistics(){
    userHelper.getAllSubmissionsWithDetails(function(err, submissions){
        var countMap = {};
        for(var i =0; i < submissions.length; i++){
            var submission = submissions[i];
            if(countMap.hasOwnProperty(submission.author.institution)){
                countMap[submission.author.institution] += 1;
            }else{
                countMap[submission.author.institution] = 1;
            }
        }
        res.json(countMap);
    });
}