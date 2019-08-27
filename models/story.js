var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StorySchema = new Schema({
    title: {type: String, required: true},
    author: {type: String},
    user: { type: Schema.ObjectId, ref: 'User' },
    book: { type: Schema.ObjectId, ref: 'Book' },
    content: {type: String, required: true},
    reference: {type: String},
    genre: [{ type: Schema.ObjectId, ref: 'Genre', required: true }],
    order: {type: Number, default: 0},
    chapter: {type: String},
    btitle: {type: String},
    comments: [{ type: Schema.ObjectId, ref: 'Comment' }],
    open: {type: String},
    rcnt: {type: Number, default: 0},
    rcusr: [{ type: Schema.ObjectId, ref: 'User' }],
    favs: {type: Number, default: 0},
    fausr: [{ type: Schema.ObjectId, ref: 'User' }],
    cct: {type: Number, default: 0},
    create_date: {type: Date, default: Date.now},
    file_path: {type: String},
    title_font: {type: String},
    title_size: {type: String}
});

// Virtual for this story instance URL.
StorySchema
.virtual('url')
.get(function () {
  return '/catalog/story/'+this._id;
});

// Export model.
module.exports = mongoose.model('Story', StorySchema);
