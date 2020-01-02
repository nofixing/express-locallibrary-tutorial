var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OxfordWordSchema = new Schema({
    title: {type: String, required: true},
    schema: {type: String, required: true},
    data: {type: String, required: true}
});

// Export model.
module.exports = mongoose.model('OxfordWord', OxfordWordSchema);
