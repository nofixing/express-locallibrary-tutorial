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



// Display memo delete form on GET.
exports.memo_delete_get = function(req, res, next) {

    async.parallel({
        memo: function(callback) {
            Memo.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.memo==null) { // No results.
            res.redirect('/catalog/memos');
        }
        // Successful, so render.
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('memo_delete', { title: 'Delete Memo', memo: results.memo, pc: pc } );
    });

};

// Handle memo delete on POST.
exports.memo_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        memo: function(callback) {
            Memo.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        // Delete object and redirect to the list of memos.
        Memo.findByIdAndRemove(req.body.id, function deleteMemo(err) {
            if (err) { return next(err); }
            // Success - got to memos list.
            res.redirect('/catalog/memos');
        });
    });

};

// Display memo update form on GET.
exports.memo_update_get = function(req, res, next) {

    // Get memo, authors and genres for form.
    async.parallel({
        memo: function(callback) {
            Memo.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.memo==null) { // No results.
            var eor = new Error('Memo not found');
            eor.status = 404;
            return next(eor);
        }
        // Success.
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('memo_form', { title: 'Update Memo', memo: results.memo, pc: pc });
    });

};


// Handle memo update on POST.
exports.memo_update_post = [

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('content').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Memo object with escaped/trimmed data and old id.
        var memo = new Memo(
          { title: req.body.title,
            user: req.session.userId,
            story: req.body.story_id,
            content: req.body.content,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('memo_form', { title: 'Update Memo', memo: memo, errors: errors.array(), pc: pc });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Memo.findByIdAndUpdate(req.params.id, memo, {}, function (err, Memo) {
                if (err) { return next(err); }
                   // Successful - redirect to memo detail page.
                   res.redirect(Memo.url);
                });
        }
    }
];

