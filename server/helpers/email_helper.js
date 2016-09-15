var nodemailer = require('nodemailer');

var config = require('../config');

// Sends an email 
function sendEmail(userEmail, subject, message) {
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: config.sender, // Your email id
            pass: config.password // Your password
        }
    });
    var mailOptions = {
        from: config.sender, // sender address
        to: userEmail, // list of receivers
        subject: subject, // Subject line
        text: message //, // plaintext body
        // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            // res.json({yo: 'error'});
        } else {
            console.log('Message sent: ' + info.response);
            // res.json({yo: info.response});
        }
    });
}



module.exports.sendEmail = sendEmail;
