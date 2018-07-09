var Word = require('../models/word');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display list of all words.
exports.word_list = function(req, res, next) {

  Word.find({user: req.session.userId}, {story: req.params.story_id}, 'title ')
    .exec(function (err, list_words) {
      if (err) { return next(err); }
      // Successful, so render
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
      res.render('word_list', { title: 'Word List', word_list:  list_words, pc: pc});
    });

};

// Display list of all words.
exports.words = function(req, res, next) {
    console.log(req.session.userId+"/"+req.query.story_id)
    Word.find({user: '5b21fd3946969f00144f2622', story: '5b2602d8b2d1122bbce72078'}, {title: 1, _id: 0})
      .exec(function (err, list_words) {
        if (err) { return next(err); }
        // Successful, so render
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(list_words));
      });
  
  };

// Display detail page for a specific word.
exports.word_detail = function(req, res, next) {

    async.parallel({
        word: function(callback) {

            Word.findById(req.params.id)
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.word==null) { // No results.
            var eor = new Error('Word not found');
            eor.status = 404;
            return next(eor);
        }
        // Successful, so render.
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('word_detail', { title: 'Title', word:  results.word, pc: pc } );
    });

};

exports.word_iframe = function(req, res, next) {

    async.parallel({
        word: function(callback) {

            Word.findById(req.params.id)
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.word==null) { // No results.
            var eor = new Error('Word not found');
            eor.status = 404;
            return next(eor);
        }
        // Successful, so render.
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('word_iframe', { word:  results.word, pc: pc } );
    });

};

// Display word create form on GET.
exports.word_create_get = function(req, res, next) {

    var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
    res.render('word_form', { title: 'Create Word', pc: pc });

};

// Handle word create on POST.
exports.word_create_post = [
    
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
  
    // Sanitize fields.
    sanitizeBody('*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Word object with escaped and trimmed data.
        var word = new Word(
          { title: req.body.title,
            user: req.session.userId,
            story: req.body.story_id,
            content: req.body.content
           });

        Word.find({user: req.session.userId, story: req.body.story_id, title: req.body.title})
           .exec(function (err, results) {
             //console.log(results);
             if (results.length > 0) { // No results.
                 console.log('already exists');
             } else {
                 console.log('word insert');
                 word.save(function (err, theWord) {
                    if (err) { return next(err); }
                        // Successful - redirect to new word record.
                        //res.redirect(word.url);
                        req.body.word_id = theWord._id;
                        res.send(req.body);
                    });
             }
           });
    }
];



// Display word delete form on GET.
exports.word_delete_get = function(req, res, next) {

    async.parallel({
        word: function(callback) {
            Word.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.word==null) { // No results.
            res.redirect('/catalog/words');
        }
        // Successful, so render.
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('word_delete', { title: 'Delete Word', word: results.word, pc: pc } );
    });

};

// Handle word delete on POST.
exports.word_delete_post = function(req, res, next) {

    Word.findByIdAndRemove(req.body.id, function deleteWord(err) {
        if (err) { return next(err); }
        // Success - got to words list.
        //res.redirect('/catalog/words');
    });

};

// Display word update form on GET.
exports.word_update_get = function(req, res, next) {

    // Get word, authors and genres for form.
    async.parallel({
        word: function(callback) {
            Word.findById(req.params.id).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.word==null) { // No results.
            var eor = new Error('Word not found');
            eor.status = 404;
            return next(eor);
        }
        // Success.
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('word_form', { title: 'Update Word', word: results.word, pc: pc });
    });

};


// Handle word update on POST.
exports.word_update_post = function(req, res, next) {

    //console.log('word update call');
    var word = new Word(
      { title: req.body.title,
        user: req.session.userId,
        story: req.body.story_id,
        content: req.body.content,
        _id:req.body.id // This is required, or a new ID will be assigned!
       });
    var newWord = new Word(
        { title: req.body.title,
          user: req.session.userId,
          story: req.body.story_id,
          content: req.body.content
         });
    //console.log('word update start');
    Word.findById({_id: req.body.id})
        .exec(function (err, results) {
          //console.log(results);
          if (results != null) {
            //console.log('word update');
            Word.findByIdAndUpdate(req.body.id, word, {}, function (err) {
                if (err) { console.log(err); return next(err); }
                });
          } else {
              //console.log('word insert');
              newWord.save(function (err, theWord) {
                 if (err) { return next(err); }
                     // Successful - redirect to new word record.
                     //res.redirect(word.url);
                     req.body.id = theWord._id;
                     res.send(req.body);
                 });
          }
        });

};

