var Genre = require('../models/genre');
var Book = require('../models/book');
var Story = require('../models/story');
var async = require('async');

const entities = require('entities');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.genre_list = function(req, res, next) {

  Genre.find({user: req.session.userId})
    .sort([['name', 'ascending']])
    .exec(function (err, list_genres) {
      if (err) { return next(err); }
      // Successful, so render.
      for (let i = 0; i < list_genres.length; i++) {
        list_genres[i].name = entities.decodehtml(list_genres[i].name);
      }
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
      res.render('genre_list', { title: 'Genre List', list_genres:  list_genres, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt });
    });

};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {

    async.parallel({
        genre: function(callback) {

            Genre.findById(req.params.id)
              .exec(callback);
        },

        genre_books: function(callback) {
          Book.find({ 'genre': req.params.id, 'user': req.session.userId })
          .exec(callback);
        },

        genre_stories: function(callback) {
            Story.find({ 'genre': req.params.id, 'user': req.session.userId, 'book': null })
            .exec(callback);
        },

    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            var ere = new Error('Genre not found');
            ere.status = 404;
            return next(ere);
        }
        results.genre.name = entities.decodehtml(results.genre.name);
        for (let i = 0; i < results.genre_books.length; i++) {
            results.genre_books[i].summary = entities.decodehtml(results.genre_books[i].summary);
            results.genre_books[i].title = entities.decodehtml(results.genre_books[i].title);
        }
        for (let i = 0; i < results.genre_stories.length; i++) {
            results.genre_stories[i].title = entities.decodehtml(results.genre_stories[i].title);
        }
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books, genre_stories: results.genre_stories, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt } );
    });

};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
    res.render('genre_form', { title: 'Create Genre', pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt });
};

// Handle Genre create on POST.
exports.genre_create_post = [

    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data.
        var genre = new Genre(
          { name: req.body.name, user:req.session.userId }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array(), pc: pc});
        return;
        }
        else {
            // Data from form is valid.
            // Check if Genre with same name already exists.
            Genre.findOne({ 'name': req.body.name, 'user': req.session.userId })
                .exec( function(err, found_genre) {
                     if (err) { return next(err); }

                     if (found_genre) {
                         // Genre exists, redirect to its detail page.
                         res.redirect(found_genre.url);
                     }
                     else {

                         genre.save(function (err) {
                           if (err) { return next(err); }
                           // Genre saved. Redirect to genre detail page.
                           res.redirect(genre.url);
                         });

                     }

                 });
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id, 'user': req.session.userId }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.genre==null) { // No results.
            res.redirect('/catalog/genres');
        }
        // Successful, so render.
        results.genre.name = entities.decodehtml(results.genre.name);
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt } );
    });

};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id, 'user': req.session.userId }).exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.genre_books.length > 0) {
            // Genre has books. Render in same way as for GET route.
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('genre_delete', { title: 'Delete Genre', genre: results.genre, genre_books: results.genre_books, pc: pc } );
            return;
        }
        else {
            // Genre has no books. Delete object and redirect to the list of genres.
            Genre.findByIdAndRemove(req.body.id, function deleteGenre(err) {
                if (err) { return next(err); }
                // Success - go to genres list.
                res.redirect('/catalog/genres');
            });

        }
    });

};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {

    Genre.findById(req.params.id, function(err, genre) {
        if (err) { return next(err); }
        if (genre==null) { // No results.
            var ere = new Error('Genre not found');
            ere.status = 404;
            return next(ere);
        }
        // Success.
        genre.name = entities.decodehtml(genre.name);
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('genre_form', { title: 'Update Genre', genre: genre, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt });
    });

};

// Handle Genre update on POST.
exports.genre_update_post = [
   
    // Validate that the name field is not empty.
    body('name', 'Genre name required').isLength({ min: 1 }).trim(),
    
    // Sanitize (trim and escape) the name field.
    sanitizeBody('name').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request .
        const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data (and the old id!)
        var genre = new Genre(
          {
          name: req.body.name, user: req.session.userId,
          _id: req.params.id
          }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values and error messages.
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('genre_form', { title: 'Update Genre', genre: genre, errors: errors.array(), pc: pc});
        return;
        }
        else {
            // Data from form is valid. Update the record.
            Genre.findByIdAndUpdate(req.params.id, genre, {}, function (err,thegenre) {
                if (err) { return next(err); }
                   // Successful - redirect to genre detail page.
                   res.redirect(thegenre.url);
                });
        }
    }
];
