var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookSchema = new Schema({
    title: {type: String, required: true},
    author: { type: String, required: true},
    summary: {type: String, required: true},
    user: { type: Schema.ObjectId, ref: 'User' },
    genre: [{ type: Schema.ObjectId, ref: 'Genre', required: true }],
    create_date: {type: Date, default: Date.now}
});

// Virtual for this book instance URL.
BookSchema
.virtual('url')
.get(function () {
  return '/catalog/book/'+this._id;
});

// Export model.
module.exports = mongoose.model('Book', BookSchema);
