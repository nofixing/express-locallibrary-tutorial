var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var WordSchema = new Schema({
    title: {type: String, required: true},
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    story: { type: Schema.ObjectId, ref: 'Story', required: true },
    content: {type: String},
    references: [{type: String}],
    skill: { type: String },
    importance: { type: String }
});

// Virtual for this word instance URL.
WordSchema
.virtual('url')
.get(function () {
  return '/catalog/word/'+this._id;
});

// Export model.
module.exports = mongoose.model('Word', WordSchema);
