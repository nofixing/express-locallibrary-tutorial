var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var StorySchema = new Schema({
    title: {type: String, required: true},
    user: { type: Schema.ObjectId, ref: 'User' },
    content: {type: String, required: true},
    references: [{type: String}],
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
