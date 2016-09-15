var mongoose = require('mongoose'), Schema = mongoose.Schema;
var ReviewsSchema = new Schema({
    id: String,
    expertise: String,
    overall_evaluation: String,
    summary: String,
    major_strong_points: String,
    weak_points: String,
    detailed_comments: String,
    user_id: String,
    submission_id: String,
    reviewed_date: Date,
    paper_title: String
}, { collection: 'conf_reviews' });
var ReviewsModel = mongoose.model('Reviews', ReviewsSchema);
module.exports = ReviewsModel;

