var Story = require('../models/story');
var Genre = require('../models/genre');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display list of all storys.
exports.story_list = function(req, res, next) {

  Story.find({user: req.session.userId}, 'title ')
    .exec(function (err, list_storys) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('story_list', { title: 'Story List', story_list:  list_storys});
    });

};

// Display detail page for a specific story.
exports.story_detail = function(req, res, next) {

    async.parallel({
        story: function(callback) {

            Story.findById(req.params.id)
              .populate('genre')
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.story==null) { // No results.
            var eor = new Error('Story not found');
            eor.status = 404;
            return next(eor);
        }
        // Successful, so render.
        results.story.content = entities.decode(results.story.content);
        console.log(results.story.content);
        res.render('story_detail', { title: 'Title', story:  results.story } );
    });

};

// Display story create form on GET.
exports.story_create_get = function(req, res, next) {

    // Get all authors and genres, which we can use for adding to our story.
    async.parallel({
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        res.render('story_form', { title: 'Create Story',genres:results.genres });
    });

};

// Handle story create on POST.
exports.story_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },

    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('content', 'Content must not be empty.').isLength({ min: 1 }).trim(),
  
    // Sanitize fields.
    sanitizeBody('*').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Story object with escaped and trimmed data.
        var story = new Story(
          { title: req.body.title,
            content: req.body.content,
            genre: req.body.genre,
            user: req.session.userId
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (story.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('story_form', { title: 'Create Story',genres:results.genres, story: story, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save story.
            story.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new story record.
                   res.redirect(story.url);
                });
        }
    }
];



// Display story delete form on GET.
exports.story_delete_get = function(req, res, next) {

    async.parallel({
        story: function(callback) {
            Story.findById(req.params.id).populate('genre').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.story==null) { // No results.
            res.redirect('/catalog/storys');
        }
        // Successful, so render.
        res.render('story_delete', { title: 'Delete Story', story: results.story } );
    });

};

// Handle story delete on POST.
exports.story_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        story: function(callback) {
            Story.findById(req.params.id).populate('genre').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        // Delete object and redirect to the list of storys.
        Story.findByIdAndRemove(req.body.id, function deleteStory(err) {
            if (err) { return next(err); }
            // Success - got to storys list.
            res.redirect('/catalog/storys');
        });
    });

};

// Display story update form on GET.
exports.story_update_get = function(req, res, next) {

    // Get story, authors and genres for form.
    async.parallel({
        story: function(callback) {
            Story.findById(req.params.id).populate('genre').exec(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.story==null) { // No results.
            var eor = new Error('Story not found');
            eor.status = 404;
            return next(eor);
        }
        // Success.
        // Mark our selected genres as checked.
        for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (var story_g_iter = 0; story_g_iter < results.story.genre.length; story_g_iter++) {
                if (results.genres[all_g_iter]._id.toString()==results.story.genre[story_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked='true';
                }
            }
        }
        res.render('story_form', { title: 'Update Story', genres:results.genres, story: results.story });
    });

};


// Handle story update on POST.
exports.story_update_post = [

    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('content', 'Content must not be empty.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('content').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Story object with escaped/trimmed data and old id.
        var story = new Story(
          { title: req.body.title,
            content: req.body.content,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form
            async.parallel({
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (story.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('story_form', { title: 'Update Story',genres:results.genres, story: story, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Story.findByIdAndUpdate(req.params.id, story, {}, function (err,thestory) {
                if (err) { return next(err); }
                   // Successful - redirect to story detail page.
                   res.redirect(thestory.url);
                });
        }
    }
];

