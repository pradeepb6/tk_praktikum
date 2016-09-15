var mongoose = require('mongoose'), Schema = mongoose.Schema;
var SubmissionsSchema = new Schema({
    id: String,
    title: String,
    abstract: String,
    keywords: Array,
    status: {type: String, enum:['incomplete','complete','closed','accepted','rejected', 'withdrawn']},
    pdf_location: String,
    date_submitted: Date,
    main_author: String,
    co_authors: Array,
    last_modified_by: String
}, { collection: 'conf_submissions' });
var SubmissionsModel = mongoose.model('Submissions', SubmissionsSchema);
module.exports = SubmissionsModel;

