var mongoose = require('mongoose'), Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
var SALT_WORK_FACTOR = 10;
var UserSchema = new Schema({
    id: String,
    salutation: String,
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    country: String,
    state: String,
    city: String,
    address_line: String,
    institution: String,
    registered_on: Date,
    last_login: Date,
    roles: Array,
    verified: Boolean,
    confirm_token: String,
    created_by: {type: String, enum:['system', 'user']}
}, { collection: 'conf_user' });

// Bcrypt middleware on UserSchema
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err)
            return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err)
                return next(err);
            user.password = hash;
            next();
        });
    });
});
//Password verification
UserSchema.method('comparePassword', function (password, cb) {
    bcrypt.compare(password, this.password, function (err, isMatch) {
        if (err)
            return cb(err);
        cb(isMatch);
    });
});
// make this available to our users in our Node applications
var UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
