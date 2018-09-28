var Memo = require('../models/memo');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display list of all memos.
exports.memo_list = function(req, res, next) {

  Memo.find({user: req.session.userId}, {story: req.params.story_id}, 'title ')
    .exec(function (err, list_memos) {
      if (err) { return next(err); }
      // Successful, so render
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
      res.render('memo_list', { title: 'Memo List', memo_list:  list_memos, pc: pc});
    });

};

// Display detail page for a specific memo.
exports.memo_detail = function(req, res, next) {

    async.parallel({
        memo: function(callback) {

            Memo.findById(req.params.id)
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.memo==null) { // No results.
            var eor = new Error('Memo not found');
            eor.status = 404;
            return next(eor);
        }
        // Successful, so render.
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('memo_detail', { title: 'Title', memo:  results.memo, pc: pc } );
    });

};

exports.memo_iframe = function(req, res, next) {

    async.parallel({
        memo: function(callback) {

            Memo.findById(req.params.id)
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.memo==null) { // No results.
            var eor = new Error('Memo not found');
            eor.status = 404;
            return next(eor);
        }
        // Successful, so render.
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('memo_iframe', { memo:  results.memo, pc: pc } );
    });

};

// Display memo create form on GET.
exports.memo_create_get = function(req, res, next) {

    res.render('memo_form', { title: 'Create Memo' });

};

// Handle memo create on POST.
exports.memo_create_post = [
    
    // Process request after validation and sanitization.
    (req, res, next) => {
        
        var memo;
        console.log('req.body.memo_id:'+req.body.memo_id);
        if(req.body.memo_id.length > 0) {
            console.log('Memo Update call');
            memo = new Memo(
                { _id: req.body.memo_id,
                  user: req.session.userId,
                  story: req.body.story_id,
                  content: req.body.content
                 });
            Memo.findByIdAndUpdate(req.body.memo_id, memo, {}, function (err) {
                if (err) { console.log(err);return next(err); }
                    // Successful - redirect to memo detail page.
                    res.send(req.body);
                });
        } else {
            memo = new Memo(
                { user: req.session.userId,
                  story: req.body.story_id,
                  content: req.body.content
                 });
            memo.save(function (err, theMemo) {
                if (err) { return next(err); }
                    // Successful - redirect to new memo record.
                    //res.redirect(memo.url);
                    //console.log('memo insert success');
                    //return next();
                    req.body.memo_id = theMemo.id;
                    console.log('theMemo.id:'+theMemo.id);
                    res.send(req.body);
                });
        }
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

