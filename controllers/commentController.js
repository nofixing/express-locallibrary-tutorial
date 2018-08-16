var Story = require('../models/story');
var Comment = require('../models/comment');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.comment_create_post = [
    (req, res, next) => {
        var comment = new Comment({ 
            story: req.body.sfkb,
            user: req.session.userId,
            content: req.body.content
            });
        
        comment.save(function(err, comment) {
            if (err) return res.send(err);
            res.redirect('/catalog/story/'+req.params.id);
        });
    }
];

exports.comment_create_post2 = [
    
    (req, res, next) => {
        
        var comment = new Comment({ 
            user: req.session.userId,
            content: req.body.content
            });
        
        comment.save(function(err, comment) {
            if (err) return res.send(err);
            Comment.findById({'_id': req.params.commentId}).exec( function(err, prnt) {
                if (err) { return next(err); }
                prnt.comments.push(comment);
                prnt.save();
                res.redirect('/catalog/story/'+req.params.id);
            });
        });
        
    }
];



exports.comment_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        comment: function(callback) {
            Comment.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        // Delete object and redirect to the list of comments.
        Comment.findByIdAndRemove(req.body.id, function deleteComment(err) {
            if (err) { return next(err); }
            // Success - got to comments list.
            res.redirect('/catalog/story/'+req.params.id);
        });
    });

};

exports.comment_update_post = [

    (req, res, next) => {

        var comment = new Comment(
          { user: req.session.userId,
            content: req.body.content,
            comments: req.body.cid,
            _id:req.params.commentId // This is required, or a new ID will be assigned!
           });

        Comment.findByIdAndUpdate(req.params.commentId, comment, {}, function (err, cmt) {
        if (err) { return next(err); }
            // Successful - redirect to comment detail page.
            res.redirect('/catalog/story/'+req.params.id);
        });
    }
];

