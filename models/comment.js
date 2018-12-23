var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
    story: { type: Schema.ObjectId, ref: 'Story' },
    user: { type: Schema.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    create_date: Date,
    comments: [ { type: Schema.ObjectId, ref: 'Comment' } ]
});

function autoPopulateSubs(next) {
    this.populate('comments');
    this.populate('user');
    next();
}
  
CommentSchema
    .pre('findOne', autoPopulateSubs)
    .pre('find', autoPopulateSubs);

module.exports = mongoose.model('Comment', CommentSchema);
