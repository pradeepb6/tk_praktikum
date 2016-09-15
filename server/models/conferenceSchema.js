var mongoose = require('mongoose'), Schema = mongoose.Schema;
var ConferenceSchema = new Schema({
    id: String,
    name: String,
    desc: String,
    start_date: Date,
    end_date: Date,
    submission_start_date: Date,
    submission_end_date: Date,
    review_start_date: Date,
    review_end_date: Date
}, { collection: 'conf_conference' });
var ConferenceModel = mongoose.model('Conference', ConferenceSchema);
module.exports = ConferenceModel;
