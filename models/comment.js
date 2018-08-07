var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    comments: [ this ]
});

module.exports = mongoose.model('Comment', CommentSchema);
