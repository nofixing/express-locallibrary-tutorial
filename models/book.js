var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookSchema = new Schema({
    title: {type: String, required: true},
    author: { type: String, required: true},
    summary: {type: String, required: true},
    wcnt: {type: Number, default: 0},
    lexile: {type: Number, default: 0},
    level: {type: Number, default: 0},
    progress: {type: Number, default: 0},
    rcnt: {type: Number, default: 0},
    start_date: {type: Date},
    end_date: {type: Date},
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
