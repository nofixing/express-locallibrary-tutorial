var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var HistorySchema = new Schema({
    title: {type: String, required: true},
    story: { type: Schema.ObjectId, ref: 'Story' },
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    date: Date
});

HistorySchema
.virtual('url')
.get(function () {
  return '/catalog/story/'+this.story;
});

module.exports = mongoose.model('History', HistorySchema);
