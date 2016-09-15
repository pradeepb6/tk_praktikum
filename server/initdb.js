var mongoose = require('mongoose');
var http = require("http");

var config = require('./config');
var UserModel = require('./models/userSchema');
var RolesModel = require('./models/rolesSchema');
var SubmissionModel = require('./models/submissionsSchema');

mongoose.connect(config.mongUrl, function (err) {
    if (err) {
        console.log('connection error', err);
    } else {
        console.log('mongodb connection successful');
    }
});


function createRoles() {
    var authorRole = new RolesModel({
        role: 'author'
    });
    authorRole.save(function(err){

    });

    var chairRole = new RolesModel({
        role: 'chair'
    });
    chairRole.save(function(err){
        
    });

    var reviewerRole = new RolesModel({
        role: 'reviewer'
    });
    reviewerRole.save(function(err){
        
    });
}


function createDummyUsers() {
    var count = 21;
    var count1 = 10;
    var count2 = 20;

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

    var chair_role_id;
    RolesModel.findOne({ 'role': 'chair' }, function (err, role) {
        chair_role_id = role._id;
    });
    http.get({
        host: 'api.randomuser.me',
        path: '/?nat=gb&results=' + count
    }, function (response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function (d) {
            body += d;
        });
        response.on('end', function () {
            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            users = parsed.results;
            console.log(parsed);
            for (var index = 0; index < count1; index++) {
                var u = users[index];
                user = new UserModel({
                    email: 'test' + index + '@test.com',
                    password: '12345',
                    registered_on: new Date(),
                    salutation: u.name.title,
                    first_name: u.name.first,
                    last_name: u.name.last,
                    country: 'Germany',
                    state: u.location.state,
                    city: u.location.city,
                    address_line: u.location.street,
                    institution: 'TU Darmstadt',
                    roles: [author_role_id],
                    created_by: 'user',
                    verified: true
                });

                

                user.save(function (err, ussr) {
                    if (err) {
                        console.log("Error while saving user ", ussr.first_name);
                    } else {
                        console.log("Successfully saved user ", ussr.first_name);
                        //date for submission
                        var submission_title = 'Title by ' + ussr.first_name;
                        var user_id = ussr._id;
                        var submission_abstract = 'Abstract of submission by ' + ussr.first_name;
                        var submission_keywords = ['angular', 'tu darmstadt', ussr.first_name];

                        // now make a submission for this user
                        submission = new SubmissionModel({
                            main_author:user_id,
                            title: submission_title,
                            abstract: submission_abstract,
                            keywords: submission_keywords,
                            status: 'incomplete',
                            date_submitted: new Date()
                        });

                        submission.save(function (err) {
                            if (err) {
                                console.log("Error while saving submission for user ",ussr.first_name);
                            } else {
                                console.log("Successfully saved submission for user  ", ussr.first_name);
                            }
                        });
                    }
                });
            }
            for (var index = 11; index < count2; index++) {
                var u = users[index];
                user = new UserModel({
                    email: 'test' + index + '@test.com',
                    password: '12345',
                    registered_on: new Date(),
                    salutation: u.name.title,
                    first_name: u.name.first,
                    last_name: u.name.last,
                    country: 'Germany',
                    state: u.location.state,
                    city: u.location.city,
                    address_line: u.location.street,
                    institution: 'TU Darmstadt',
                    roles: [review_role_id],
                    created_by: 'user',
                    verified: true
                });

                user.save(function (err, ussr) {
                    if (err) {
                        console.log("Error while saving user ", ussr.first_name);
                    } else {
                        console.log("Successfully saved user ", ussr.first_name);
                    }
                });
            }
            user = new UserModel({
                email: 'chair@test.com',
                password: '12345',
                registered_on: new Date(),
                salutation: u.name.title,
                first_name: u.name.first,
                last_name: u.name.last,
                country: 'Germany',
                state: u.location.state,
                city: u.location.city,
                address_line: u.location.street,
                institution: 'TU Darmstadt',
                roles: [chair_role_id],
                created_by: 'user',
                verified: true
            });



            user.save(function (err, ussr) {
                if (err) {
                    console.log("Error while saving user ", ussr.first_name);
                } else {
                    console.log("Successfully saved user ", ussr.first_name);
                }
            });
        });
    });


};


 // createRoles();
createDummyUsers();