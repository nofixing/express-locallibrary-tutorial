var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ChatGPTSchema = new Schema({
  user: { type: Schema.ObjectId, ref: 'User', required: true },
  story: { type: Schema.ObjectId, ref: 'Story', required: true },
  content: { type: String },
});

// Virtual for this memo instance URL.
ChatGPTSchema.virtual('url').get(function () {
  return '/catalog/chatGPT/' + this._id;
});

// Export model.
module.exports = mongoose.model('ChatGPT', ChatGPTSchema);
