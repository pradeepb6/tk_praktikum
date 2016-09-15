var mongoose = require('mongoose'), Schema = mongoose.Schema;
var RolesSchema = new Schema({
    id: String,
    role: String
}, { collection: 'conf_roles' });
var RolesModel = mongoose.model('Roles', RolesSchema);
module.exports = RolesModel;
