var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var OxfordWordSchema = new Schema({
    title: {type: String, required: true},
    gubun: {type: String, required: true},
    data: {type: String, required: true},
    word: {type: String},
    kdata: {type: String},
    create_date: {type: Date, default: Date.now}
});

// Export model.
module.exports = mongoose.model('OxfordWord', OxfordWordSchema);
