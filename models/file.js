var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FileSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    story: { type: Schema.ObjectId, ref: 'Story', required: true },
    file_path: {type: String},
    file_size: {type: Number},
    create_date: {type: Date, default: Date.now}
});

// Export model.
module.exports = mongoose.model('File', FileSchema);
