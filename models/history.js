var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var HistorySchema = new Schema({
    story: { type: Schema.ObjectId, ref: 'Story' },
    book: { type: Schema.ObjectId, ref: 'Book' },
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    create_date: Date
});

HistorySchema
.virtual('url')
.get(function () {
  return '/catalog/story/'+this.story._id;
});

module.exports = mongoose.model('History', HistorySchema);
