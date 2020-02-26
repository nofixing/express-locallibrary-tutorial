var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var Story = require('../models/story');
var User = require('../models/user');
var History = require('../models/history');
var moment = require('moment');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

var async = require('async');

exports.index = function(req, res, next) {

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
        history: function(callback) {
            History.find({user: req.session.userId}).populate('story','title').populate('book','title').skip(0).limit(5).sort({create_date: -1}).exec(callback);
        },
    }, function(err, results) {
        console.log('Inside the homepage callback function');
        console.log(req.sessionID);
        console.log(req.device.type.toUpperCase());
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        var cert = req.query.cert;
        var cfnt = req.query.cfnt;
        var cfwt = req.query.cfwt;
        var clang = req.query.clang;
        console.log('we are here.');
        if (req.session.userId) {
            console.log("req.session exists");
            console.log("req.session.clang:"+req.session.clang);
            var name = req.session.userName;
            for (let i = 0; i < results.history.length; i++) {
                results.history[i].story.title = entities.decode(results.history[i].story.title);
                if (results.history[i].book != null) {
                    results.history[i].book.title = entities.decode(results.history[i].book.title);
                }
            }
            if ( (clang != '' && clang != 'undefined' && typeof clang != 'undefined' && clang == 'en') || req.session.clang == 'en' ) {
                name += ",";
            } else {
                name += "님,";
            }
            if (cfnt != '' && cfnt != 'undefined' && typeof cfnt != 'undefined' && req.session.cfnt != cfnt) {
                User.update({_id: req.session.userId}, {
                    cfnt: cfnt
                }, function(err, theUser) {
                    if (err) { return next(err); }
                    req.session.cfnt = cfnt;
                    console.log("update cfnt:"+cfnt+"/update to:"+req.session.cfnt);
                    res.render('index', { title: 'Welcome to Infinite Storlet', error: err, data: results, cert: cert, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt, name: name, userEmail: req.session.userEmail });
                });
            } else if (clang != '' && clang != 'undefined' && typeof clang != 'undefined' && req.session.clang != clang) {
                User.update({_id: req.session.userId}, {
                    clang: clang
                }, function(err, theUser) {
                    if (err) { return next(err); }
                    req.session.clang = clang;
                    console.log("update clang:"+clang);
                    res.render('index', { title: 'Welcome to Infinite Storlet', error: err, data: results, cert: cert, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt, name: name, userEmail: req.session.userEmail });
                });
            } else if (cfwt != '' && cfwt != 'undefined' && typeof cfwt != 'undefined' && req.session.cfwt != cfwt) {
                User.update({_id: req.session.userId}, {
                    cfwt: cfwt
                }, function(err, theUser) {
                    if (err) { return next(err); }
                    req.session.cfwt = cfwt;
                    console.log("update cfwt:"+cfwt+"/update to:"+req.session.cfwt);
                    res.render('index', { title: 'Welcome to Infinite Storlet', error: err, data: results, cert: cert, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt, name: name, userEmail: req.session.userEmail });
                });
            } else {
                console.log("normal access");
                res.render('index', { title: 'Welcome to Infinite Storlet', error: err, data: results, cert: cert, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt, name: name, userEmail: req.session.userEmail });
            }
        } else {
            res.render('index', { title: 'Welcome to Infinite Storlet', error: err, data: results, cert: cert, pc: pc, userEmail: req.session.userEmail });
        }
        
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
      res.render('book_list', { title: 'Book List', book_list:  list_books, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt });
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
        for (let i = 0; i < results.stories.length; i++) {
            var str = results.stories[i].content;
            var len = str.split(" ").length;
            results.stories[i].len = len;
            if(typeof results.stories[i].chapter == 'undefined' || results.stories[i].chapter == '') {
                results.stories[i].chapter = '';
            } else {
                results.stories[i].chapter += ',';
            }
        }
        results.book.summary = entities.decode(results.book.summary);
        results.book.title = entities.decode(results.book.title);
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('book_detail', { title: 'Title', book:  results.book, stories: results.stories, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt } );
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
        res.render('book_form', { title: 'Create Book',genres:results.genres, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt });
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
    body('genre', 'Genre must be choose.').isLength({ min: 1 }),

    // Sanitize fields.
    //sanitizeBody('*').trim().escape(),
    //sanitizeBody('genre.*').trim().escape(),
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
                res.render('book_form', { title: 'Create Book', genres:results.genres, book: book, errors: errors.array(), pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt });
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
        results.book.title = entities.decode(results.book.title);
        for (let i = 0; i < results.book.genre.length; i++) {
            results.book.genre[i].name = entities.decode(results.book.genre[i].name);
        }
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('book_delete', { title: 'Delete Book', book: results.book, stories: results.stories, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt } );
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
            res.render('book_delete', { title: 'Delete Book', book: results.book, stories: results.stories, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt } );
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
            res.render('book_form', { title: 'Update Book', genres:results.genres, book: results.book, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt });
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
    body('genre', 'Genre must be choose.').isLength({ min: 1 }),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('genre.*').escape(),

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
                    Story.update({book: req.params.id}, {
                        btitle: req.body.title
                    }, function(err, theStory) {
                        if (err) { return next(err); }
                    });
                   res.redirect(thebook.url);
                });
        }
    }
];

exports.book_datatable = function (req, res, next) {

    var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
    res.render('book_board_list', { title: 'Book List', hostname: req.headers.host, pc: pc, cfnt: req.session.cfnt, cfwt: req.session.cfwt });

};

function getSorts(query) {
    var sortables;
    if (query.order[0].column == '1') {
        sortables = { title: query.order[0].dir };
    } else if (query.order[0].column == '2') {
        sortables = { wcnt: query.order[0].dir };
    } else if (query.order[0].column == '3') {
        sortables = { lexile: query.order[0].dir };
    } else if (query.order[0].column == '4') {
        sortables = { level: query.order[0].dir };
    } else if (query.order[0].column == '5') {
        sortables = { progress: query.order[0].dir };
    } else if (query.order[0].column == '6') {
        sortables = { rcnt: query.order[0].dir };
    } else if (query.order[0].column == '7') {
        sortables = { start_date: query.order[0].dir };
    } else if (query.order[0].column == '8') {
        sortables = { end_date: query.order[0].dir };
    } else {
        sortables = { create_date: 'desc' };
    }
    
    return sortables;
}

exports.book_datatable_list = function (req, res, next) {
    console.log('req.body.action:'+req.body.action);
    console.log('req.body:'+JSON.stringify(req.body));
    if(typeof req.body.action == 'undefined') {
        console.log('Right now here!');
        var sortables = getSorts(req.body);
        console.log('sortables:'+JSON.stringify(sortables));
        var searchStr = req.body.search.value;
        if (req.body.search.value) {
            var regex = new RegExp(req.body.search.value, "i");
            searchStr = {
                user: { $in: [req.session.userId]}, 
                $or: [{
                    'title': { $regex: '.*' + req.body.search.value + '.*' }
                }]
            };
        } else {
            searchStr = {user: { $in: [req.session.userId]}};
        }

        var recordsTotal = 0;
        var recordsFiltered = 0;

        Book.count({user: { $in: [req.session.userId]}}, function (err, c) {
            recordsTotal = c;
            console.log('recordsTotal:'+c);
            Book.count(searchStr, function (err, c) {
                if (err) { console.log(err); return next(err); }
                recordsFiltered = c;
                //console.log('recordsFiltered:'+c);console.log('start:'+req.body.start);console.log('length:'+req.body.length);
                var start = Number(req.body.start);
                var length = Number(req.body.length);
                if(length == -1) length = 1000000;
                Book.find(searchStr)
                    .skip(start).limit(length).sort(sortables)
                    .lean()
                    .exec(function (err, list_books) {
                        if (err) { return next(err); }
                        for (let i = 0; i < list_books.length; i++) {
                            list_books[i].rownum = start + i + 1;
                            list_books[i].title = entities.decode(list_books[i].title);
                            if(list_books[i].start_date != null){
                                list_books[i].start_date = moment(list_books[i].start_date).format('YYYY-MM-DD');
                            }
                            if(list_books[i].end_date != null){
                                list_books[i].end_date = moment(list_books[i].end_date).format('YYYY-MM-DD');
                            }
                            if(list_books[i].create_date != null){
                                list_books[i].create_date = moment(list_books[i].create_date).format('YYYY-MM-DD');
                            }
                        }
                        //console.log('list_books:'+JSON.stringify(list_books));
                        var data = JSON.stringify({
                            "draw": req.body.draw,
                            "recordsFiltered": recordsFiltered,
                            "recordsTotal": recordsTotal,
                            "data": list_books
                        });
                        res.send(data);
                });
            });
        });
    } else if (req.body.action == 'edit') {
        //console.log('req.body.data:'+JSON.stringify(req.body.data));
        var obj = req.body.data, kyz = Object.keys(obj);
        //console.log('key:'+kyz[0]);
        //console.log('req.body.data.title:'+JSON.stringify(obj[kyz[0]]));
        //console.log('req.body.data.title:'+obj[kyz[0]].title);
        var sDt = obj[kyz[0]].start_date.trim() == '' ? '':new Date(obj[kyz[0]].start_date);
        var eDt = obj[kyz[0]].end_date.trim() == '' ? '':new Date(obj[kyz[0]].end_date);
        var cDt = obj[kyz[0]].create_date.trim() == '' ? '':new Date(obj[kyz[0]].create_date);
        console.log('eDt['+eDt+']');
        Book.update({_id: kyz}, {
            wcnt: obj[kyz[0]].wcnt,
            lexile: obj[kyz[0]].lexile,
            level: obj[kyz[0]].level,
            progress: obj[kyz[0]].progress,
            rcnt: obj[kyz[0]].rcnt,
            start_date: sDt,
            end_date: eDt,
            create_date: cDt
        }, function(err, upBook) {
            if (err) { console.log(err); return next(err); }
            var theBook = [{
                "_id": kyz[0],
                "title": obj[kyz[0]].title,
                "wcnt": obj[kyz[0]].wcnt,
                "lexile": obj[kyz[0]].lexile,
                "level": obj[kyz[0]].level,
                "progress": obj[kyz[0]].progress,
                "rcnt": obj[kyz[0]].rcnt,
                "start_date": obj[kyz[0]].start_date,
                "end_date": obj[kyz[0]].end_date,
                "create_date": obj[kyz[0]].create_date
            }];
            var data = JSON.stringify({
                "action": "edit",
                "data": theBook
            });
            console.log('upBook:'+data);
            res.send(data);
        });
    } else if (req.body.action == 'remove') {
        console.log('req.body.data:'+JSON.stringify(req.body.data));
        var obj = req.body.data, kyz = Object.keys(obj);
        Book.findByIdAndRemove(kyz[0], function deleteBook(err) {
            if (err) { console.log(err); return next(err); }
            var theBook = [{
                "_id": kyz[0]
            }];
            var data = JSON.stringify({
                "action": "remove",
                "data": theBook
            });
            console.log('removeBook:'+data);
            res.send(data);
        });
    }
};
