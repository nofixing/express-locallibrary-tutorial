var Story = require('../models/story');
var Genre = require('../models/genre');
var Word = require('../models/word');
var Memo = require('../models/memo');
var Book = require('../models/book');
var Comment = require('../models/comment');
var History = require('../models/history');
var BookMark = require('../models/bookMark');
var File = require('../models/file');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display list of all stories.
exports.story_list = function(req, res, next) {

  //Story.find({$and:[{user: req.session.userId}, {book: null}, {$or: [{open: null}, {open: 'N'}]}] }).collation({locale: 'en' }).sort({create_date: 1})
  Story.find({$and:[{user: req.session.userId}, {book: null}] }).collation({locale: 'en' }).sort({create_date: -1})
    .exec(function (err, list_stories) {
      if (err) { return next(err); }
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
      for (let i = 0; i < list_stories.length; i++) {
        var str = list_stories[i].content;
        var len = str.split(" ").length;
        list_stories[i].len = len;
      }
      res.render('story_list', { title: 'Story List', story_list:  list_stories, pc: pc, cfnt: req.session.cfnt });
    });

};

exports.story_open_list = function(req, res, next) {

    var mxcnt = 0;
    if(typeof req.body.mxcnt !='undefined') {
        mxcnt = req.body.mxcnt;
    }
    
    var ct = 0;
    if(typeof req.body.stle !='undefined' && req.body.stle != '') {
        Story.find({open: 'Y', $or:[ {title: { $regex: '.*' + req.body.stle + '.*' }}, {btitle: { $regex: '.*' + req.body.stle + '.*' }}]})
            .count().exec(function (err, count) {
            ct =count;
        });
        Story.find({open: 'Y', $or:[ {title: { $regex: '.*' + req.body.stle + '.*' }}, {btitle: { $regex: '.*' + req.body.stle + '.*' }}]})
            .skip(mxcnt).limit(mxcnt+50).sort({create_date: -1, order: 1})
            .populate('user')
            .populate('book')
            .exec(function (err, list_stories) {
            if (err) { return next(err); }
            for (let i = 0; i < list_stories.length; i++) {
                var str = list_stories[i].content;
                var len = str.split(" ").length;
                list_stories[i].len = len;
                list_stories[i].btitle = entities.decode(list_stories[i].btitle);
            }
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('story_open_list', { title: 'Story List', story_list:  list_stories, hostname: req.headers.host, pc: pc, mxcnt: mxcnt+50, ct: ct, cfnt: req.session.cfnt });
        });
    } else {
        Story.find({open: 'Y'}).count().exec(function (err, count) {
            ct =count;
        });
        Story.find({open: 'Y'}).skip(mxcnt).limit(mxcnt+50).sort({create_date: -1, order: 1})
            .populate('user')
            .populate('book')
            .exec(function (err, list_stories) {
            if (err) { return next(err); }
            for (let i = 0; i < list_stories.length; i++) {
                var str = list_stories[i].content;
                var len = str.split(" ").length;
                list_stories[i].len = len;
                list_stories[i].btitle = entities.decode(list_stories[i].btitle);
            }
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('story_open_list', { title: 'Story List', story_list:  list_stories, hostname: req.headers.host, pc: pc, mxcnt: mxcnt+50, ct: ct, cfnt: req.session.cfnt });
        });
    }
  
};

exports.story_open_ajax = function(req, res, next) {
    console.log("Server side story_open_ajax called.");
    var mxcnt = 0;
    if(typeof req.body.mxcnt !='undefined') {
        mxcnt = req.body.mxcnt;
    }
    mxcnt = Number(mxcnt);
    var ct = 0;
    
    if(typeof req.body.stle !='undefined' && req.body.stle != '') {
        Story.find({open: 'Y', $or:[ {title: { $regex: '.*' + req.body.stle + '.*' }}, {btitle: { $regex: '.*' + req.body.stle + '.*' }}]})
            .count().exec(function (err, count) {
            ct =count;
        });
        Story.find({open: 'Y', $or:[ {title: { $regex: '.*' + req.body.stle + '.*' }}, {btitle: { $regex: '.*' + req.body.stle + '.*' }}]})
            .skip(mxcnt).limit(mxcnt+50).sort({create_date: -1, order: 1})
            .populate('user')
            .exec(function (err, list_stories) {
                if (err) { 
                    console.log(err);
                    return next(err); 
                }
                
                list_stories.mxcnt = mxcnt+50;
                list_stories.ct = ct;
                //console.log(list_stories);
                res.send(list_stories);
        });
    } else {
        Story.find({open: 'Y'}).count().exec(function (err, count) {
            ct =count;
        });
        Story.find({open: 'Y'}).skip(mxcnt).limit(mxcnt+50).sort({create_date: -1, order: 1})
            .populate('user')
            .exec(function (err, list_stories) {
                if (err) { 
                    console.log(err);
                    return next(err); 
                }
                
                list_stories.mxcnt = mxcnt+50;
                list_stories.ct = ct;
                console.log(list_stories);
                res.send(list_stories);
        });
    }
  
};

exports.story_list_ajax = function(req, res, next) {

    Story.find({book: req.body.book}).collation({locale: 'en' }).sort({order: 1})
      .exec(function (err, list_stories) {
        if (err) { return next(err); }
        for (let i = 0; i < list_stories.length; i++) {
            if(typeof list_stories[i].chapter == 'undefined' || list_stories[i].chapter == '') {
                list_stories[i].chapter = '';
            } else {
                list_stories[i].chapter += ', ';
            }
            list_stories[i].title = entities.decode(list_stories[i].title);
        }
        res.send(list_stories);
      });
  
};

// Display detail page for a specific story.
exports.story_detail = function(req, res, next) {
    console.log('story_detail start, req.param.id->'+req.params.id);
    async.parallel({
        story: function(callback) {
            Story.findById(req.params.id)
              .populate('genre')
              .populate('book')
              .exec(callback);
        },
        comments: function(callback) {
            //console.log("user:"+req.session.userId+"/story:"+req.params.id);
            Comment.find({story: req.params.id}).populate('user').sort({create_date: 1}).exec(callback);
        },
        words: function(callback) {
            //console.log("user:"+req.session.userId+"/story:"+req.params.id);
            /*
            if (req.query.open == 'Y') {
                Word.find({story: req.params.id}).collation({locale: 'en' }).sort({title: 1})
                    .exec(callback);
            } else {
                Word.find({user: req.session.userId, story: req.params.id}).collation({locale: 'en' }).sort({title: 1})
                .exec(callback);
            }
            */
           Word.find({story: req.params.id}).collation({locale: 'en' }).sort({create_date: 1, order: 1})
                .exec(callback);
        },
        memo: function(callback) {
            //console.log("user:"+req.session.userId+"/story:"+req.params.id);
            /*
            if (req.query.open == 'Y') {
                Memo.find({story: req.params.id}, {content: 1})
                //Memo.find({story: req.params.id})
                    .exec(callback);
            } else {
                Memo.find({user: req.session.userId, story: req.params.id}, {content: 1})
                //Memo.find({user: req.session.userId, story: req.params.id})
                    .exec(callback);
            }
            */
           Memo.find({story: req.params.id})
                .exec(callback);
        },
        bookMark: function(callback) {
            BookMark.find({user: req.session.userId, story: req.params.id})
                .exec(callback);
        },
        files: function(callback) {
            File.find({user: req.session.userId, story: req.params.id, 
                $or:[ {file_name: { $regex: '.*' + 'mp3' }}, {file_name: { $regex: '.*' + 'ogg' }},
                {file_name: { $regex: '.*' + 'wav' }}]}).select('file_path file_name file_size')
                .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.story==null) { // No results.
            var eor = new Error('Story not found');
            eor.status = 404;
            return next(eor);
        }
        results.story.title = entities.decode(results.story.title);
        var book_title = '';
        var book_id = '';
        if (typeof results.story.book != 'undefined'){
            book_title = entities.decode(results.story.book.title);
            book_id = results.story.book._id;
        }
        if (results.story.user != req.session.userId) {
            if (typeof results.story.open == 'undefined' || results.story.open != 'Y'){
              return res.redirect('/catalog/');  
            }
            Story.findById({'_id': req.params.id}).exec( function (err,theStory) {
                var isThere = false;
                for (let i = 0; i < theStory.rcusr.length; i++) {
                    if( req.session.userId == theStory.rcusr[i] ) isThere = true;
                }
                
                if (!isThere) {
                    theStory.rcnt = Number(theStory.rcnt)+1;
                    theStory.rcusr.push(req.session.userId);
                    theStory.save();
                }
                /*
                Story.update({_id: req.params.id}, {
                    rcnt: results.story.rcnt+1
                }, function(err, theStory) {
                });
                */
            });
        }
        History.find({user: req.session.userId, story: req.params.id}).exec( function (err,theHistory) {
            if (err) { console.log(err); return next(err); }
            if (theHistory.length == 0) {
                console.log("history not exists");
                var history = new History(
                    { title: results.story.title,
                      story: req.params.id,
                      user: req.session.userId,
                      create_date: Date.now()
                     });
                history.save(function (err) {
                    if (err) { console.log(err); return next(err); }
                    //console.log("history saved");
                }); 
            } else {
                //console.log(theHistory);
                var newvalues = { $set: {create_date: Date.now()} };
                History.findByIdAndUpdate(theHistory[0]._id, newvalues, {}, function(err, updatedHistory) {
                    if (err) { console.log(err); return next(err); }
                    //console.log("history updated");
                    //console.log("updatedHistory:"+updatedHistory);
                });
                /*
                History.update({_id: theHistory._id}, {
                    create_date: Date.now()
                }, function(err, updatedHistory) {
                    if (err) { console.log(err); return next(err); }
                    console.log("history updated");
                });
                */
            }
        });
        results.story.content = entities.decode(results.story.content);
        if(req.body.tlp == 'y') {
            var txt = results.story.content;
            //var highlightHtml = '<span class="hgt" style="color:black;">$1</span>';
            var highlightHtml = '';
            var sTag = '';
            for (let i = 0; i < results.words.length; i++) {
                if (typeof results.words[i].image_address != 'undefined' && typeof results.words[i].content != 'undefined') {
                    //console.log(results.words[i].image_address);
                    //console.log(results.words[i].content);
                    sTag = "<img src="+results.words[i].image_address+"><h5>"+results.words[i].content+"</h5>";
                    highlightHtml = '<a href="#" target="_blank" class="tltp" title="'+sTag+'">$1</a>';
                } else if(typeof results.words[i].content != 'undefined') {
                    //console.log('content:'+results.words[i].content);
                    sTag = "<h5>"+results.words[i].content+"</h5>";
                    highlightHtml = '<a href="#" target="_blank" class="tltp" title="'+sTag+'">$1</a>';
                } else {
                    highlightHtml = results.words[i].title;
                }
                
                txt = txt.replace(new RegExp('(' + '\\b' + results.words[i].title + '\\b' + ')', 'gi'), highlightHtml);
            }
            /*
            for (let i = 0; i < results.words.length; i++) {
                txt = txt.replace(new RegExp('(' + '\\b' + results.words[i].title + '\\b' + ')', 'gi'), highlightHtml);
            }
            */
            results.story.content = txt;
        }
        /*
        for (let i = 0; i < results.files.length; i++) {
            console.log('for index:'+i);  
            var file_path = results.files[i].file_path;
            var ext = file_path.substring(file_path.length - 3, file_path.length);
            console.log('file extension:'+ext);
            if(ext.toLowerCase() != 'mp3' && ext.toLowerCase() != 'ogg' && ext.toLowerCase() != 'wav') {
                console.log('This file will be deleted:'+file_path);
                results.files.splice(i,1);
                i = 0;
            }
        }
        */
        results.story.reference = entities.decode(results.story.reference);
        var memo = '';
        var memo_id = '';
        if(results.memo.length > 0) {
            memo = entities.decode(results.memo[0].content);
            memo_id = results.memo[0]._id;
        }
        //console.log("memo:"+memo);
        var anchor = '';
        var bookMark_id = '';
        if(results.bookMark.length > 0) {
            anchor = results.bookMark[0].anchor;
            bookMark_id = results.bookMark[0]._id;
        }
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        var vName = 'story_detail';
        if (pc == '') vName = 'story_mdtl';
        res.render(vName, 
        { title: 'Title', story:  results.story, comments: results.comments, memo: memo, memo_id: memo_id, anchor: anchor, bookMark_id: bookMark_id, 
        word_list:results.words, hostname: req.headers.host, pc: pc, userId: req.session.userId, cfnt: req.session.cfnt, book_title: book_title, book_id: book_id,
        tooltip:req.body.tlp, files: results.files } );
    });

};

exports.favs_ajax = function(req, res, next) {
    console.log('0000000000000');
    req.body.fayn = 'N';
    var id = req.body.story_id;
    console.log(id);
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('99999999999999');
    } else {
      console.log('id is not valid ObjectId');
    }
    if (req.body.stusr != req.session.userId) {
        var isThere = false;
        Story.findOne({'_id':id}).exec( function (err,theStory) {
            if (err) { console.log(err); return next(err); }
            console.log('11111111111111');
            for (let i = 0; i < theStory.fausr.length; i++) {
                if( req.session.userId == theStory.fausr[i] ) isThere = true;
            }
            console.log('22222222222222');
            if (!isThere) {
                console.log('33333333333333');
                theStory.favs = Number(req.body.facnt)+1;
                theStory.fausr.push(req.session.userId);
                console.log('44444444444444');
                theStory.save(function (err, saveStory) {
                    if (err) { console.log(err); return next(err); }
                });
                console.log('555555555555555');
                req.body.fayn = 'Y';
            } else {
              console.log('666666666666666');
            }
            res.send(req.body);
        });
        /*
        Story.update({_id: req.body.story_id}, {
            favs: Number(req.body.facnt)+1
        }, function(err, theStory) {
            if (err) { return next(err); }
            res.send(theStory);
        });
        */
    } else {
      console.log('77777777777777777');  
      res.send(req.body);
    }

};

exports.bookMark_ajax = [
    
    // Process request after validation and sanitization.
    (req, res, next) => {
        
        var bookMark;
        console.log('req.body.bookMark_id:'+req.body.bookMark_id);
        if(req.body.bookMark_id.length > 0) {
            console.log('BookMark Update call');
            bookMark = new BookMark(
                { _id: req.body.bookMark_id,
                  user: req.session.userId,
                  story: req.body.story_id,
                  anchor: req.body.anchor
                 });
            BookMark.findByIdAndUpdate(req.body.bookMark_id, bookMark, {}, function (err) {
                if (err) { console.log(err);return next(err); }
                    var newvalues = { $set: {content: req.body.content} };
        
                    Story.findByIdAndUpdate(req.body.story_id, newvalues, {}, function (err,theStory) {
                        if (err) { return next(err); }
                    });
                    res.send(req.body);
                });
        } else {
            bookMark = new BookMark(
                { user: req.session.userId,
                  story: req.body.story_id,
                  anchor: req.body.anchor
                 });
                bookMark.save(function (err, theBookMark) {
                    if (err) { return next(err); }
                    var newvalues = { $set: {content: req.body.content} };
            
                    Story.findByIdAndUpdate(req.body.story_id, newvalues, {}, function (err,theStory) {
                        if (err) { return next(err); }
                    });
                    req.body.bookMark_id = theBookMark.id;
                    console.log('theBookMark.id:'+theBookMark.id);
                    res.send(req.body);
                });
        }
    }
];

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
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('story_iframe', { story:  results.story, pc: pc } );
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
        for (var i = 0; i < results.books.length; i++) {
            results.books[i].title = entities.decode(results.books[i].title);
        }
        var bok = req.query.book;
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('story_form', { title: 'Create Story',books:results.books,genres:results.genres, bok: bok, hostname: req.headers.host, pc: pc, cfnt: req.session.cfnt });
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
            user: req.session.userId,
            order: req.body.order,
            chapter: req.body.chapter,
            btitle: req.body.btitle,
            open: req.body.open,
            create_date: Date.now(),
            title_font: req.body.title_font,
            title_size: req.body.title_size
           });

        var storyOnly = new Story(
            { title: req.body.title,
              author: req.body.author,
              content: req.body.content,
              reference: req.body.reference,
              genre: req.body.genre,
              user: req.session.userId,
              create_date: Date.now(),
              open: req.body.open,
              title_font: req.body.title_font,
              title_size: req.body.title_size
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
                var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
                res.render('story_form', { title: 'Create Story',books:results.books,genres:results.genres, story: story, hostname: req.headers.host, errors: errors.array(), pc: pc });
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
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('story_delete', { title: 'Delete Story', story: results.story, pc: pc, cfnt: req.session.cfnt } );
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
        if (results.story.book != undefined) {
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
            History.find({ user:req.session.userId, story:req.body.id }).remove().exec();
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
        files: function(callback) {
            File.find({user: req.session.userId, story: req.params.id})
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
        for (var i = 0; i < results.books.length; i++) {
            results.books[i].title = entities.decode(results.books[i].title);
        }
        results.story.content = entities.decode(results.story.content);
        results.story.title = entities.decode(results.story.title);
        var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
        res.render('story_form', { title: 'Update Story', books:results.books, genres:results.genres, story: results.story
        , hostname: req.headers.host, pc: pc, cfnt: req.session.cfnt, files:results.files });
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
            btitle: req.body.btitle,
            order: req.body.order,
            chapter: req.body.chapter,
            open: req.body.open,
            title_font: req.body.title_font,
            title_size: req.body.title_size,
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
                var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
                res.render('story_form', { title: 'Update Story',books:results.books,genres:results.genres, story: story, errors: errors.array(), pc: pc });
            });
            return;
        }
        else {
            if(req.body.book == '') {
                Story.update({_id: req.params.id}, {
                    title: req.body.title,
                    author: req.body.author,
                    content: req.body.content,
                    reference: req.body.reference,
                    genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
                    open: req.body.open,
                    title_font: req.body.title_font,
                    title_size: req.body.title_size
                }, function(err, theStory) {
                    if (err) { return next(err); }
                    // Successful - redirect to story detail page.
                    res.redirect("/catalog/story/"+req.params.id);
                });
            } else {
                Story.update({_id: req.params.id}, {
                    title: req.body.title,
                    author: req.body.author,
                    content: req.body.content,
                    reference: req.body.reference,
                    book: req.body.book,
                    btitle: req.body.btitle,
                    open: req.body.open,
                    order: req.body.order,
                    chapter: req.body.chapter,
                    title_font: req.body.title_font,
                    title_size: req.body.title_size
                }, function(err, theStory) {
                    if (err) { return next(err); }
                    // Successful - redirect to story detail page.
                    console.log("story updated:"+theStory);
                    res.redirect("/catalog/story/"+req.params.id);
                });
            }
            
            
            
            // Data from form is valid. Update the record.
            /*
            Story.findByIdAndUpdate(req.params.id, story, {}, function (err,theStory) {
                if (err) { return next(err); }
                   // Successful - redirect to story detail page.
                   res.redirect(theStory.url);
                });
            */
        }
    }
];

exports.story_preview = function(req, res, next) {
    console.log("story story_preview");
    res.render('preview', { content: req.body.content, cfnt: req.session.cfnt } );

};

exports.story_update_preview = function(req, res, next) {
    console.log("story story_update_preview");
    res.render('preview', { content: req.body.content, cfnt: req.session.cfnt } );

};
