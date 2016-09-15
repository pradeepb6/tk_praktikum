// require npm modules
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');


// require our modules
var config = require('./server/config');


var app = express();
app.set('secret', config.secret);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// require schema
var UserModel = require('./server/models/userSchema');

// get an instance of the router for api routes
var publicApiRoutes = require('./server/api/public');
var userApiRoutes = require('./server/api/user');
var authorApiRoutes = require('./server/api/author');
var reviewerApiRoutes = require('./server/api/reviewer');
var chairApiRoutes = require('./server/api/chair');



app.use('/api/public', publicApiRoutes);
app.use('/api/user', userApiRoutes);
app.use('/api/author', authorApiRoutes);
app.use('/api/reviewer', reviewerApiRoutes);
app.use('/api/chair', chairApiRoutes);

app.use(express.static(path.join(__dirname, '/app')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));


app.get('/emailConfirm/:token', function (req, res) {
    var query = { 'confirm_token': req.params.token };
    UserModel.findOneAndUpdate(query, { verified: true, confirm_token: '' }, function (err, users) {
        if (err) return console.error(err);
        if(users)
            res.sendFile(__dirname + '/app/emailconfirmed.html');
        else
            res.sendFile(__dirname + '/app/invalidtoken.html');
    });
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/app/index.html');
});

mongoose.connect(config.mongUrl, function (err) {
    if (err) {
        console.log('connection error', err);
    } else {
        console.log('mongodb connection successful');
    }
});

app.listen(3000);
console.log('Magic happens on 3000');