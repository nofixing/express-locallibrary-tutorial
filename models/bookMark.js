var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var BookMarkSchema = new Schema({
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    story: { type: Schema.ObjectId, ref: 'Story', required: true },
    anchor: {type: String}
});

// Virtual for this bookMark instance URL.
BookMarkSchema
.virtual('url')
.get(function () {
  return '/catalog/bookMark/'+this._id;
});

// Export model.
module.exports = mongoose.model('BookMark', BookMarkSchema);
