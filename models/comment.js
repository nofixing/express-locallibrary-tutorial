var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    story: { type: Schema.ObjectId, ref: 'Story' },
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    comments: [ { type: Schema.ObjectId, ref: 'Comment' } ]
});

function autoPopulateSubs(next) {
    this.populate('comments');
    next();
}
  
CommentSchema
    .pre('findOne', autoPopulateSubs)
    .pre('find', autoPopulateSubs);

module.exports = mongoose.model('Comment', CommentSchema);
