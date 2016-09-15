var mongoose = require('mongoose'), Schema = mongoose.Schema;
var EventsSchema = new Schema({
    id: String,
    name: String,
    event_type: {type: String, enum:['submission', 'review', 'others']},    //make it unique
    desc: String,
    start_date: Date,
    end_date: Date
}, { collection: 'conf_events' });
var EventsModel = mongoose.model('Events', EventsSchema);
module.exports = EventsModel;
