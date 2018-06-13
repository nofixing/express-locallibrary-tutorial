var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StorySchema = new Schema({
    title: {type: String, required: true},
    author: {type: String},
    user: { type: Schema.ObjectId, ref: 'User' },
    book: { type: Schema.ObjectId, ref: 'Book' },
    content: {type: String, required: true},
    reference: {type: String},
    genre: [{ type: Schema.ObjectId, ref: 'Genre' }]
});

// Virtual for this story instance URL.
StorySchema
.virtual('url')
.get(function () {
  return '/catalog/story/'+this._id;
});

// Export model.
module.exports = mongoose.model('Story', StorySchema);
