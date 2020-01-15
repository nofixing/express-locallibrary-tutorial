var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var WordSchema = new Schema({
    title: {type: String, required: true},
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    book: { type: Schema.ObjectId, ref: 'Book' },
    book_title: {type: String},
    story: { type: Schema.ObjectId, ref: 'Story', required: true },
    story_title: {type: String},
    content: {type: String},
    references: [{type: String}],
    skill: { type: String },
    importance: { type: String },
    create_date: {type: Date},
    image_address: { type: String },
    oxford_word: { type: Schema.ObjectId, ref: 'OxfordWord' }
});

// Virtual for this word instance URL.
WordSchema
.virtual('url')
.get(function () {
  return '/catalog/word/'+this._id;
});

// Export model.
module.exports = mongoose.model('Word', WordSchema);
