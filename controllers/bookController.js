var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var Story = require('../models/story');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.index = function(req, res) {

    async.parallel({
        book_count: function(callback) {
            Book.find({user: req.session.userId}).count(callback);
        },
        book_instance_count: function(callback) {
            BookInstance.count(callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.count({status:'Available'},callback);
        },
        author_count: function(callback) {
            Author.count(callback);
        },
        genre_count: function(callback) {
            Genre.find({user: req.session.userId}).count(callback);
        },
        story_count: function(callback) {
            Story.find({$and:[{user: req.session.userId}, {book: null}, {$or: [{open: null}, {open: 'N'}]}] }).count(callback);
        },
    }, function(err, results) {
        console.log('Inside the homepage callback function');
        console.log(req.sessionID);
        console.log(req.device.type.toUpperCase());
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        var cert = req.query.cert;
        res.render('index', { title: 'Welcome to Infinite Storlet', error: err, data: results, cert: cert, pc: pc });
    });
};


// Display list of all books.
exports.book_list = function(req, res, next) {

  Book.find({user: req.session.userId}).collation({locale: 'en' }).sort({title: 1})
    .exec(function (err, list_books) {
      if (err) { return next(err); }
      // Successful, so render
        for (let i = 0; i < list_books.length; i++) {
            list_books[i].title = entities.decode(list_books[i].title);
        }
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
      res.render('book_list', { title: 'Book List', book_list:  list_books, pc: pc});
    });

};

exports.book_ajax = function(req, res, next) {

    Book.findById(req.body.id)
      .populate('genre')
      .exec(function (err, book) {
        if (err) { return next(err); }
        res.send(book);
      });
  
  };

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id)
              .populate('genre')
              .exec(callback);
        },
        stories: function(callback) {
            Story.find({book:req.params.id}).collation({locale: 'en' }).sort({order: 1})
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            var eor = new Error('Book not found');
            eor.status = 404;
            return next(eor);
        }
        for (let i = 0; i < results.book.genre.length; i++) {
            results.book.genre[i].name = entities.decode(results.book.genre[i].name);
        }
        results.book.summary = entities.decode(results.book.summary);
        results.book.title = entities.decode(results.book.title);
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('book_detail', { title: 'Title', book:  results.book, stories: results.stories, pc: pc } );
    });

};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {

    // Get all authors and genres, which we can use for adding to our book.
    async.parallel({
        genres: function(callback) {
            Genre.find({user: req.session.userId}, 'name ')
            .exec(callback);
        },
    }, function(err, results) {
        if (err) { console.log(err); return next(err); }
        for (let i = 0; i < results.genres.length; i++) {
            results.genres[i].name = entities.decode(results.genres[i].name);
        }
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('book_form', { title: 'Create Book',genres:results.genres, pc: pc });
    });

};

// Handle book create on POST.
exports.book_create_post = [
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
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('genre', 'Genre must be choose.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('*').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
        

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            user: req.session.userId,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                genres: function(callback) {
                    Genre.find({user: req.session.userId}, 'name ')
                        .exec(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                    results.genres[i].name = entities.decode(results.genres[i].name);
                }
                var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
                res.render('book_form', { title: 'Create Book', genres:results.genres, book: book, errors: errors.array(), pc: pc });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
];



// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('genre').exec(callback);
        },
        stories: function(callback) {
            Story.find({ 'book': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.book==null) { // No results.
            res.redirect('/catalog/books');
        }
        results.book.summary = entities.decode(results.book.summary);
        for (let i = 0; i < results.book.genre.length; i++) {
            results.book.genre[i].name = entities.decode(results.book.genre[i].name);
        }
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('book_delete', { title: 'Delete Book', book: results.book, stories: results.stories, pc: pc } );
    });

};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('genre').exec(callback);
        },
        stories: function(callback) {
            Story.find({ 'book': req.params.id }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.stories.length > 0) {
            // Book has book_instances. Render in same way as for GET route.
            for (let i = 0; i < results.book.genre.length; i++) {
                results.book.genre[i].name = entities.decode(results.book.genre[i].name);
            }
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('book_delete', { title: 'Delete Book', book: results.book, stories: results.stories, pc: pc } );
            return;
        }
        else {
            // Book has no BookInstance objects. Delete object and redirect to the list of books.
            Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
                if (err) { return next(err); }
                // Success - got to books list.
                res.redirect('/catalog/books');
            });

        }
    });

};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {

    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('genre').exec(callback);
        },
        genres: function(callback) {
            Genre.find({user: req.session.userId}).exec(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.book==null) { // No results.
                var eor = new Error('Book not found');
                eor.status = 404;
                return next(eor);
            }
            results.book.summary = entities.decode(results.book.summary);
            results.book.title = entities.decode(results.book.title);
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                results.genres[all_g_iter].name = entities.decode(results.genres[all_g_iter].name);
                for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('book_form', { title: 'Update Book', genres:results.genres, book: results.book, pc: pc });
        });

};


// Handle book update on POST.
exports.book_update_post = [

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
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('genre', 'Genre must be choose.').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            user: req.session.userId,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id // This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form
            async.parallel({
                genres: function(callback) {
                    Genre.find({user: req.session.userId});
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
                res.render('book_form', { title: 'Update Book', genres:results.genres, book: book, errors: errors.array(), pc: pc });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thebook.url);
                });
        }
    }
];

