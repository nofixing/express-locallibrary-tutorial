var Story = require('../models/story');
var Genre = require('../models/genre');
var Word = require('../models/word');
var Memo = require('../models/memo');
var Book = require('../models/book');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display list of all stories.
exports.story_list = function(req, res, next) {

  Story.find({user: req.session.userId, book: null}).collation({locale: 'en' }).sort({title: 1})
    .exec(function (err, list_stories) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('story_list', { title: 'Story List', story_list:  list_stories});
    });

};

exports.story_list_ajax = function(req, res, next) {

    Story.find({book: req.body.book}, 'title ')
      .exec(function (err, list_stories) {
        if (err) { return next(err); }
        res.send(list_stories);
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
        words: function(callback) {
            //console.log("user:"+req.session.userId+"/story:"+req.params.id);
            Word.find({user: req.session.userId, story: req.params.id}).collation({locale: 'en' }).sort({title: 1})
                .exec(callback);
        },
        memo: function(callback) {
            //console.log("user:"+req.session.userId+"/story:"+req.params.id);
            Memo.find({user: req.session.userId, story: req.params.id}, {content: 1})
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.story==null) { // No results.
            var eor = new Error('Story not found');
            eor.status = 404;
            return next(eor);
        }
        var txt = entities.decode(results.story.content);
        var highlightHtml = '<span class="hgt" style="color:black;">$1</span>';
        //console.log(results.words.length);
        for (let i = 0; i < results.words.length; i++) {
            //console.log(results.words[i]);
            //console.log(results.words[i].content);
            txt = txt.replace(new RegExp('(' + results.words[i].title + ')', 'gi'), highlightHtml);
        }
        results.story.content = txt;
        results.story.reference = entities.decode(results.story.reference);
        var memo = '';
        var memo_id = '';
        if(results.memo.length > 0) {
            memo = results.memo[0].content;
            memo_id = results.memo[0]._id;
        }
        // Successful, so render.
        //console.log(results.story.content);
        res.render('story_detail', 
        { title: 'Title', story:  results.story, memo: memo, memo_id: memo_id, word_list:results.words, hostname: req.headers.host } );
    });

};

exports.story_iframe = function(req, res, next) {

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
        res.render('story_iframe', { story:  results.story } );
    });

};

// Display story create form on GET.
exports.story_create_get = function(req, res, next) {

    // Get all authors and genres, which we can use for adding to our story.
    async.parallel({
        books: function(callback) {
            Book.find({user: req.session.userId}, 'title ')
                .exec(callback);
        },
        genres: function(callback) {
            Genre.find({user: req.session.userId}, 'name ')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        for (let i = 0; i < results.genres.length; i++) {
            results.genres[i].name = entities.decode(results.genres[i].name);
        }
        var bok = req.query.book;
        res.render('story_form', { title: 'Create Story',books:results.books,genres:results.genres, bok: bok, hostname: req.headers.host });
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
        console.log(req.body.genre);
        next();
    },
    
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('content', 'Content must not be empty.').isLength({ min: 1 }).trim(),
    body('genre', 'Genre must be choose.').isLength({ min: 1 }).trim(),
  
    // Sanitize fields.
    sanitizeBody('genre.*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Story object with escaped and trimmed data.
        var story = new Story(
          { title: req.body.title,
            author: req.body.author,
            content: req.body.content,
            reference: req.body.reference,
            genre: req.body.genre,
            book: req.body.book,
            user: req.session.userId
           });

        var storyOnly = new Story(
            { title: req.body.title,
              author: req.body.author,
              content: req.body.content,
              reference: req.body.reference,
              genre: req.body.genre,
              user: req.session.userId
             });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                books: function(callback) {
                    Book.find({user: req.session.userId}, 'title ')
                        .exec(callback);
                },
                genres: function(callback) {
                    Genre.find({user: req.session.userId}, 'name ')
                        .exec(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    results.genres[i].name = entities.decode(results.genres[i].name);
                    if (story.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                story.content = entities.decode(story.content);
                res.render('story_form', { title: 'Create Story',books:results.books,genres:results.genres, story: story, hostname: req.headers.host, errors: errors.array() });
            });
            return;
        }
        else {
            if (req.body.book == '') {

                storyOnly.save(function (err) {
                    if (err) { console.log(err); return next(err); }
                       // Successful - redirect to new story record.
                       res.redirect(storyOnly.url);
                    });

            } else {

                story.save(function (err) {
                    if (err) { console.log(err); return next(err); }
                       // Successful - redirect to new story record.
                       res.redirect(story.url);
                    });
                
            }
                
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
            res.redirect('/catalog/stories');
        }
        for (var i = 0; i < results.story.genre.length; i++) {
            results.story.genre[i].name = entities.decode(results.story.genre[i].name);
        }
        // Successful, so render.
        results.story.content = entities.decode(results.story.content);
        results.story.title = entities.decode(results.story.title);
        res.render('story_delete', { title: 'Delete Story', story: results.story } );
    });

};

// Handle story delete on POST.
exports.story_delete_post = function(req, res, next) {

    // Assume the post has valid id (ie no validation/sanitization).

    async.parallel({
        story: function(callback) {
            Story.findById(req.body.id).populate('genre').exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        var aul = '';
        if (results.story.book != '') {
            console.log("There is book");
            aul = '/catalog/book/'+results.story.book;
        } else {
            console.log("There is no book");
            aul = '/catalog/stories';
        }
        // Delete object and redirect to the list of stories.
        Story.findByIdAndRemove(req.body.id, function deleteStory(err) {
            if (err) { return next(err); }
            // Success - got to stories list.
            res.redirect(aul);
        });
    });

};

// Display story update form on GET.
exports.story_update_get = function(req, res, next) {

    // Get story, authors and genres for form.
    async.parallel({
        books: function(callback) {
            Book.find({user: req.session.userId}, 'title ')
            .exec(callback);
        },
        story: function(callback) {
            Story.findById(req.params.id).populate('genre').exec(callback);
        },
        genres: function(callback) {
            Genre.find({user: req.session.userId}, 'name ')
                .exec(callback);
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
            results.genres[all_g_iter].name = entities.decode(results.genres[all_g_iter].name);
            for (var story_g_iter = 0; story_g_iter < results.story.genre.length; story_g_iter++) {
                if (results.genres[all_g_iter]._id.toString()==results.story.genre[story_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked='true';
                }
            }
        }
        results.story.content = entities.decode(results.story.content);
        res.render('story_form', { title: 'Update Story', books:results.books, genres:results.genres, story: results.story, hostname: req.headers.host });
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
    body('genre', 'Genre must be choose.').isLength({ min: 1 }).trim(),

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
            author: req.body.author,
            content: req.body.content,
            reference: req.body.reference,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            book: req.body.book,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form
            async.parallel({
                books: function(callback) {
                    Book.find({user: req.session.userId}, 'title ')
                        .exec(callback);
                },
                genres: function(callback) {
                    Genre.find({user: req.session.userId}, 'name ')
                        .exec(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    results.genres[i].name = entities.decode(results.genres[i].name);
                    if (story.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                story.content = entities.decode(story.content);
                res.render('story_form', { title: 'Update Story',books:results.books,genres:results.genres, story: story, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Story.findByIdAndUpdate(req.params.id, story, {}, function (err,theStory) {
                if (err) { return next(err); }
                   // Successful - redirect to story detail page.
                   res.redirect(theStory.url);
                });
        }
    }
];

