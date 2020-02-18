var Story = require('../models/story');
var Genre = require('../models/genre');
var Word = require('../models/word');
var Memo = require('../models/memo');
var Book = require('../models/book');
var Comment = require('../models/comment');
var History = require('../models/history');
var BookMark = require('../models/bookMark');
var File = require('../models/file');
var OxfordWord = require('../models/oxfordWord');
var fs = require('fs');
var path = require('path');
var moment = require('moment');

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');
const {Translate} = require('@google-cloud/translate').v2;

// Your Google Cloud Platform project ID
const projectId = 'infinitestorlet';

// Instantiates a client

const translate = new Translate({
  projectId: projectId,
  credentials: {
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL
  }
});


var client_id = 'BdLjzx4yosbmSqFb4feb';
var client_secret = process.env.NAVER_TRANSLATE_CLIENT_SECRET;

var async = require('async');

var OxfordDictionary = require('../middleware/oxford');
  
var oxford_app_id = "26926fc1";
var oxford_app_key = process.env.OXFORD_ACCOUNT_APP_KEY;

var tooltip_naver_url = 'http://tooltip.dic.naver.com/tooltip.nhn?languageCode=4&nlp=false&wordString=';

exports.download_get = function(req, res, next) {
    console.log('Root directory is '+req.app.get('rootDir'));
    var rtd = req.app.get('rootDir');
  	Story.findById(req.params.id).exec(function (err, theStory) {
		if (err) { return next(err); }

		fs.readFile(rtd+'/public/download_template.html', 'utf8', function (err,data) {
			if (err) { return next(err); }

			theStory.content = entities.decode(theStory.content);
			theStory.reference = entities.decode(theStory.reference);
			theStory.title = entities.decode(theStory.title);

			var result = data.replace(/tsfgkpmhr/g, theStory.title);
			result = result.replace(/tgbyhnujb/g, req.session.cfnt);
            result = result.replace(/poilkjmnb/g, theStory.title_font);
            if(typeof theStory.chapter !='undefined') {
                result = result.replace(/cftvgybhu/g, theStory.chapter);
            } else {
                result = result.replace(/cftvgybhu/g, '');
            }
			result = result.replace(/emdfgtfrd/g, theStory.title_size);
            result = result.replace(/acqjjqgfj/g, theStory.author);
            if(typeof theStory.reference !='undefined') {
                result = result.replace(/uypotfhuj/g, theStory.reference);
            } else {
                result = result.replace(/uypotfhuj/g, '');
            }
			result = result.replace(/rdftgyhvf/g, theStory.content);

			var fileName = theStory.title+'.html';
			fs.writeFile(rtd+'/temp/'+fileName, result, 'utf8', function (err) {
				if (err) { return next(err); }
                console.log('File is created successfully.');
                const file = `${rtd}/temp/${fileName}`;
			    res.download(file);
			});
		});
    });

};

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

exports.withdrawal = function(req, res, next) {
    console.log('withdrawal start');
	res.render('withdrawal', { hostname: req.headers.host, cfnt: req.session.cfnt });

};

exports.privacy_policy = function(req, res, next) {

	res.render('privacyPolicy', { cfnt: req.session.cfnt });

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
           Word.find({story: req.params.id}).populate('oxford_word', 'word').collation({locale: 'en' }).sort({index_of: 1, create_date: 1})
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
        
        for (let i = 0; i < results.words.length; i++) {
            if (results.words[i].oxford_word != null && results.words[i].oxford_word.word != null) {
                results.words[i].orgTitle = results.words[i].oxford_word.word.replace(/_/g, ' ');
            } else {
                results.words[i].orgTitle = results.words[i].title;
            }
        }

        var ttp = '';
        if(req.body.tlp == 'y') {
            var txt = results.story.content;
            //var highlightHtml = '<span class="hgt" style="color:black;">$1</span>';
            var highlightHtml = '';
            var sTag = '';
            for (let i = 0; i < results.words.length; i++) {
                if (typeof results.words[i].image_address != 'undefined' && typeof results.words[i].content != 'undefined') {
                    console.log(results.words[i].image_address);
                    //console.log(results.words[i].content);
                    var ssc = results.words[i].image_address;
                    if(ssc.indexOf('youtu') > -1) {
                        var arr = ssc.split("/");
                        var lnum = ssc.split("/").length -1;
                        var vsrc = arr[lnum];
                        console.log('vsrc0:'+vsrc);
                        if(vsrc.indexOf('watch?v=') > -1) {
                            var arr2 = vsrc.split("=");
                            vsrc = arr2[1];
                            console.log('vsrc1:'+vsrc);
                            if(vsrc.indexOf('&') > -1) {
                                vsrc = vsrc.substring(0, vsrc.indexOf('&'));
                            }
                        }
                        console.log('vsrc:'+vsrc);
                        ssc = '<iframe width="640" height="360" src="//www.youtube.com/embed/'+vsrc+'" frameborder="0" allowfullscreen></iframe><br>';
                    } else {
                        ssc = '<img src="'+ssc+'"><br>';
                    }
                    var ttl = 'ttwrd'+i;
                    var add_cnt = '';
                    if(typeof results.words[i].add_content != 'undefined') add_cnt = results.words[i].add_content;
                    sTag += '<div id="'+ttl+'">'+ssc+results.words[i].content+add_cnt+'</div>\n';
                    highlightHtml = '<span class="tltp" data-tooltip-content="#'+ttl+'">$1</span>';
                } else if(typeof results.words[i].content != 'undefined') {
                    //console.log('content:'+results.words[i].content);
                    var ttl = 'ttwrd'+i;
                    var add_cnt = '';
                    if(typeof results.words[i].add_content != 'undefined') add_cnt = results.words[i].add_content;
                    sTag += '<div id="'+ttl+'">'+results.words[i].content+add_cnt+'</div>\n';
                    highlightHtml = '<span class="tltp" data-tooltip-content="#'+ttl+'">$1</span>';
                } else {
                    highlightHtml = results.words[i].title;
                }
                txt = txt.replace(new RegExp('(' + '\\b' + results.words[i].title + '\\b' + ')', 'gi'), highlightHtml);
            }
            results.story.content = txt;
            console.log('sTag:'+sTag);
            ttp = sTag;
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
        //console.log('story.genre:'+results.story.genre);
        for (let i = 0; i < results.story.genre.length; i++) {
            results.story.genre[i].name = entities.decode(results.story.genre[i].name);
        }
        res.render(vName, 
        { title: 'Title', story:  results.story, comments: results.comments, memo: memo, memo_id: memo_id, anchor: anchor, bookMark_id: bookMark_id, 
        word_list:results.words, hostname: req.headers.host, pc: pc, userId: req.session.userId, cfnt: req.session.cfnt, book_title: book_title, book_id: book_id,
        tooltip:req.body.tlp, files: results.files, ttp: ttp } );
    });

};

exports.favs_ajax = function(req, res, next) {
    console.log('favs_ajax, story_id->'+req.body.story_id);
    req.body.fayn = 'N';
    var id = req.body.story_id;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('id is valid ObjectId');
    } else {
      console.log('id is not valid ObjectId');
    }
    if (req.body.stusr != req.session.userId) {
        var isThere = false;
        Story.findOne({'_id':id}).exec( function (err,theStory) {
            if (err) { console.log(err); return next(err); }
            for (let i = 0; i < theStory.fausr.length; i++) {
                if( req.session.userId == theStory.fausr[i] ) isThere = true;
            }
            if (!isThere) {
                theStory.favs = Number(req.body.facnt)+1;
                theStory.fausr.push(req.session.userId);
                theStory.save(function (err, saveStory) {
                    if (err) { console.log(err); return next(err); }
                });
                req.body.fayn = 'Y';
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
				for (var i = 0; i < results.files.length; i++) {
            results.files[i].file_name = results.files[i].file_name.substring(14);
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

exports.story_oxford = function(req, res, next) {
    
    console.log('story_oxford start -> query:'+req.query.word);
    
    var config = {
        app_id : oxford_app_id,
        app_key : oxford_app_key,
        source_lang : "en-us"
    };  
  
    var dict = new OxfordDictionary(config);
    
    var props = {
        word: req.query.word,
        // filters: "grammaticalFeatures=singular,past;lexicalCategory=noun",
        //fields: "definitions,domains,etymologies,examples,pronunciations,regions,registers,variantForms"
        fields: req.query.fields
    };
    
    var lookup = dict.find(props);

    lookup.then(function(data) {
        //console.log('=======================================story_oxford find -> data:'+data);
        //var voca = JSON.parse(data);
        console.log('parse result ->'+JSON.stringify(data));
        var results = data.results;
        for (let i = 0; i < results.length; i++) {
            var lexicalEntries = results[i].lexicalEntries;
            for (let j = 0; j < lexicalEntries.length; j++) {
                var entries = lexicalEntries[j].entries;
                //console.log('entries ->'+JSON.stringify(entries));
            }
            //console.log('lexicalEntries ->'+JSON.stringify(lexicalEntries));
        }
        //console.log('parse result results->'+results);
        res.render('oxford_data', { dic_content: JSON.stringify(data) } );
    },
    function(err) {
        console.log('req.query.word:'+req.query.word+'     story_oxford err:'+err); return next(err);
    });
};

function createOxfordWord(title, gubun, data, kdata) {
    var oxfordWord = new OxfordWord(
        {
            title: title,
            gubun: gubun,
            data: data,
            kdata: kdata
        });
    oxfordWord.save(function (err, theOxfordWord) {
        if (err) { console.log(err); }
        console.log('theOxfordWord._id:'+theOxfordWord._id);
        return theOxfordWord._id;
    });
}

function updateOxfordWord(id, kdata) {
    console.log('updateOxfordWord start -> id:'+id+'; kdata:'+kdata);
    OxfordWord.update({_id: id}, {
        kdata: kdata
    }, function(err, theOxfordWord) {
        if (err) { console.log('err:'+err); }
    });
}

exports.story_oxford_ajax = function(req, res, next) {
    
    console.log('story_oxford_ajax start -> query:'+req.body.word);

    OxfordWord.find({title: req.body.word, gubun: 'word'}).exec( function (err,theOxfordWord) {
        if (err) { console.log(err); return next(err); }
        if (theOxfordWord.length > 0) {
            console.log('Retrieve from local DB');
            req.body.dic_content = theOxfordWord[0].data.replace(/\"/g, '"');
            req.body.dic_kcontent = '{}';
            console.log('theOxfordWord[0].kdata:'+theOxfordWord[0].kdata);
            if(typeof theOxfordWord[0].kdata !='undefined') {
                req.body.dic_kcontent = theOxfordWord[0].kdata;
                req.body.oxfordWord_id = theOxfordWord[0]._id;
                req.body.oxfordWord_word = theOxfordWord[0].word;
                if (typeof theOxfordWord[0].translation !='undefined') {
                    req.body.translation = theOxfordWord[0].translation;
                } else {
                    req.body.translation = '';
                }
                res.send(req.body);
            } else {
                const request = require('request');
                request(tooltip_naver_url+req.body.word, function (error, response, kdata) {
                    if (error) { console.error(error); }
                    console.log(`statusCode: ${response.statusCode}`);
                    console.log(kdata);
                    if (req.body.word.indexOf('_') < 0) req.body.dic_kcontent = JSON.stringify(kdata);
                    req.body.oxfordWord_id = theOxfordWord[0]._id;
                    req.body.oxfordWord_word = theOxfordWord[0].word;
                    console.log('req.body.dic_kcontent:'+req.body.dic_kcontent);
                    updateOxfordWord(theOxfordWord[0]._id, req.body.dic_kcontent);
                    if (typeof theOxfordWord[0].translation !='undefined') {
                        req.body.translation = theOxfordWord[0].translation;
                    } else {
                        req.body.translation = '';
                    }
                    res.send(req.body);
                });
            }
        } else {
            console.log('Retrieve from Oxford');

            const request = require('request');
            req.body.dic_kcontent = '{}';
            
            var config = {
                app_id : oxford_app_id,
                app_key : oxford_app_key,
                source_lang : "en-us"
            };  
            
            var dict = new OxfordDictionary(config);
            
            var props = {
                word: req.body.word,
                // filters: "grammaticalFeatures=singular,past;lexicalCategory=noun",
                //fields: "definitions,domains,etymologies,examples,pronunciations,regions,registers,variantForms"
                fields: req.body.fields
            };
            
            var lookup = dict.find(props);
        
            lookup.then(function(data) {
                console.log('parse result ->'+JSON.stringify(data));
                var results = data.results;
                var derivative_word = '';
                var isDerivativeOf = false;
                for (let i = 0; i < results.length; i++) {
                    var lexicalEntries = results[i].lexicalEntries;
                    for (let j = 0; j < lexicalEntries.length; j++) {
                        var derivativeOf = lexicalEntries[j].derivativeOf;
                        if (typeof derivativeOf === 'object') {
                            derivative_word = derivativeOf[0].text;
                            isDerivativeOf = true;
                            if (req.body.word.indexOf('_') > -1) isDerivativeOf = false;
                        }
                    }
                }
        
                if(isDerivativeOf) {
                    props = {
                        word: derivative_word,
                        fields: req.body.fields
                    };
                    var lookup4 = dict.find(props);
        
                    lookup4.then(function(data4) {
                        console.log('parse result4 ->'+JSON.stringify(data4));
                        req.body.dic_content = JSON.stringify(data4);
                        //var oxfordWord_id = createOxfordWord(req.body.word, 'word', req.body.dic_content, req.body.dic_kcontent);
                        request(tooltip_naver_url+derivative_word, function (error, response, kdata) {
                            if (error) { console.error(error); }
                            console.log(`statusCode: ${response.statusCode}`);
                            console.log(kdata);
                            req.body.dic_kcontent = JSON.stringify(kdata);

                            var gtranslation = '';
                            var ntranslation = '';
                            var translation = '';
                            
                            translate.translate(derivative_word, 'ko').then(results => {
                                gtranslation = results[0];
                                console.log(`GTranslation: ${gtranslation}`);
                            
                                var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
                                var options = {
                                    url: api_url,
                                    form: {'source':'en', 'target':'ko', 'text':derivative_word},
                                    headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
                                    };
                                request.post(options, function (er, rsp, body) {
                                    if (!er && rsp.statusCode == 200) {
                                        //res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
                                        //res.end(body);
                                        //console.log(`Translation json: ${body}`);
                                        var json = JSON.parse(body);
                                        console.log(`NTranslation: ${json.message.result.translatedText}`);
                                        ntranslation = json.message.result.translatedText;
        
                                        translation = gtranslation;
                                        if (translation.trim() == '') {
                                            translation = ntranslation;
                                        } else {
                                            if (translation.indexOf(ntranslation) < 0) translation += ', '+ntranslation;
                                        }
        
                                        var oxfordWord = new OxfordWord(
                                            {
                                                title: req.body.word,
                                                gubun: 'word',
                                                data: req.body.dic_content,
                                                word: derivative_word,
                                                kdata: req.body.dic_kcontent,
                                                translation: translation
                                            });
                                        oxfordWord.save(function (err, theOxfordWord) {
                                            if (err) { console.log(err); }
                                            console.log('theOxfordWord._id 1:'+theOxfordWord._id);
                                            req.body.oxfordWord_id = theOxfordWord._id;
                                            req.body.oxfordWord_word = theOxfordWord.word;
                                            req.body.translation = translation;
                                            res.send(req.body);
                                        });                   
        
                                    } else {
                                        console.log('er = ' + rsp.statusCode);
                                        res.send(req.body);
                                    }
                                });
        
                            
                            }).catch(err => {
                                console.error('ERROR:', err);
                                res.send(req.body);
                            });

                        });
                    },
                    function(err4) {
                        console.log('req.query.word:'+derivative_word+'     story_oxford_ajax err4:'+err4); 
                        if(err4.indexOf('No such entry found.') > -1) {
                            
                        }
                        return next(err4);
                    });
                } else {
                    req.body.dic_content = JSON.stringify(data);
                    //var oxfordWord_id = createOxfordWord(req.body.word, 'word', req.body.dic_content, req.body.dic_kcontent);
                    request(tooltip_naver_url+req.body.word, function (error, response, kdata) {
                        if (error) { console.error(error); }
                        console.log(`statusCode: ${response.statusCode}`);
                        console.log(kdata);
                        if (req.body.word.indexOf('_') < 0) req.body.dic_kcontent = JSON.stringify(kdata);
                        var gtranslation = '';
                        var ntranslation = '';
                        var translation = '';
                        
                        translate.translate(req.body.word, 'ko').then(results => {
                            gtranslation = results[0];
                            console.log(`GTranslation: ${gtranslation}`);
                        
                            var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
                            var options = {
                                url: api_url,
                                form: {'source':'en', 'target':'ko', 'text':req.body.word},
                                headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
                                };
                            request.post(options, function (er, rsp, body) {
                                if (!er && rsp.statusCode == 200) {
                                    //res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
                                    //res.end(body);
                                    //console.log(`Translation json: ${body}`);
                                    var json = JSON.parse(body);
                                    console.log(`NTranslation: ${json.message.result.translatedText}`);
                                    ntranslation = json.message.result.translatedText;
    
                                    translation = gtranslation;
                                    if (translation.trim() == '') {
                                        translation = ntranslation;
                                    } else {
                                        if (translation.indexOf(ntranslation) < 0) translation += ', '+ntranslation;
                                    }
    
                                    var oxfordWord = new OxfordWord(
                                        {
                                            title: req.body.word,
                                            gubun: 'word',
                                            data: req.body.dic_content,
                                            word: req.body.word,
                                            kdata: req.body.dic_kcontent,
                                            translation: translation
                                        });
                                    oxfordWord.save(function (err, theOxfordWord) {
                                        if (err) { console.log(err); }
                                        console.log('theOxfordWord._id 1:'+theOxfordWord._id);
                                        req.body.oxfordWord_id = theOxfordWord._id;
                                        req.body.oxfordWord_word = theOxfordWord.word;
                                        req.body.translation = translation;
                                        res.send(req.body);
                                    });                   
    
                                } else {
                                    console.log('er = ' + rsp.statusCode);
                                    res.send(req.body);
                                }
                            });
                        
                        }).catch(err => {
                            console.error('ERROR:', err);
                            res.send(req.body);
                        });
                    });
                }
        
            },
            function(err) {
                console.log('req.query.word:'+req.body.word+'     story_oxford_ajax err:'+err); 
                if(JSON.stringify(err).indexOf('No such entry found.') > -1) {
                    console.log('lemmas start');
                    var config2 = {
                        app_id : oxford_app_id,
                        app_key : oxford_app_key,
                        source_lang : "en"
                    };
                    var dict2 = new OxfordDictionary(config2);
                    var lookup2 = dict2.lemmas(req.body.word);
        
                    lookup2.then(function(data2) {
                        console.log('parse result2 ->'+JSON.stringify(data2));
                        var lexicalEntries = data2.results[0].lexicalEntries;
                        var lemmas_word = data2.results[0].lexicalEntries[0].inflectionOf[0].text;
                        for (let i = 0; i < lexicalEntries.length; i++) {
                            console.log('lexicalEntries[i].inflectionOf[0].text ->'+lexicalEntries[i].inflectionOf[0].text);
                            if(req.body.word != lexicalEntries[i].inflectionOf[0].text) {
                                lemmas_word = lexicalEntries[i].inflectionOf[0].text.replace(/-/g, '');
                                break;
                            }
                        }
                        
                        props = {
                            word: lemmas_word,
                            fields: req.body.fields
                        };
                        var lookup3 = dict.find(props);
        
                        lookup3.then(function(data3) {
                            console.log('parse result3 ->'+JSON.stringify(data3));
                            req.body.dic_content = JSON.stringify(data3);
                            //var oxfordWord_id = createOxfordWord(req.body.word, 'word', req.body.dic_content, req.body.dic_kcontent);
                            request(tooltip_naver_url+lemmas_word, function (error, response, kdata) {
                                if (error) { console.error(error); }
                                console.log(`statusCode: ${response.statusCode}`);
                                console.log(kdata);
                                req.body.dic_kcontent = JSON.stringify(kdata);

                                var gtranslation = '';
                                var ntranslation = '';
                                var translation = '';
                                
                                translate.translate(lemmas_word, 'ko').then(results => {
                                    gtranslation = results[0];
                                    console.log(`GTranslation: ${gtranslation}`);
                                
                                    var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
                                    var options = {
                                        url: api_url,
                                        form: {'source':'en', 'target':'ko', 'text':lemmas_word},
                                        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
                                        };
                                    request.post(options, function (er, rsp, body) {
                                        if (!er && rsp.statusCode == 200) {
                                            //res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
                                            //res.end(body);
                                            //console.log(`Translation json: ${body}`);
                                            var json = JSON.parse(body);
                                            console.log(`NTranslation: ${json.message.result.translatedText}`);
                                            ntranslation = json.message.result.translatedText;
            
                                            translation = gtranslation;
                                            if (translation.trim() == '') {
                                                translation = ntranslation;
                                            } else {
                                                if (translation.indexOf(ntranslation) < 0) translation += ', '+ntranslation;
                                            }
            
                                            var oxfordWord = new OxfordWord(
                                                {
                                                    title: req.body.word,
                                                    gubun: 'word',
                                                    data: req.body.dic_content,
                                                    word: lemmas_word,
                                                    kdata: req.body.dic_kcontent,
                                                    translation: translation
                                                });
                                            oxfordWord.save(function (err, theOxfordWord) {
                                                if (err) { console.log(err); }
                                                console.log('theOxfordWord._id 1:'+theOxfordWord._id);
                                                req.body.oxfordWord_id = theOxfordWord._id;
                                                req.body.oxfordWord_word = theOxfordWord.word;
                                                req.body.translation = translation;
                                                res.send(req.body);
                                            });                   
            
                                        } else {
                                            console.log('er = ' + rsp.statusCode);
                                            res.send(req.body);
                                        }
                                    });
            
                                
                                }).catch(err => {
                                    console.error('ERROR:', err);
                                    res.send(req.body);
                                });

                            });
                        },
                        function(err3) {
                            console.log('req.query.word:'+lemmas_word+'     story_oxford_ajax err3:'+err3); 
                            if(err3.indexOf('No such entry found.') > -1) {
                                
                            }
                            return next(err3);
                        });
        
                    },
                    function(err2) {
                        console.log('req.query.word:'+req.body.word+'     story_oxford_ajax err2:'+err2); 
                        if(err2.indexOf('No such entry found.') > -1) {
                            
                        }
                        return next(err2);
                    });
                } else {
                    return next(err);
                }
            });

        }
    });
    
};

exports.story_oxford_ajaxt = function(req, res, next) {
    
    console.log('story_oxford_ajaxt start -> query:'+req.body.word);
    
    OxfordWord.find({title: req.body.word, gubun: 'thesaurus'}).exec( function (err,theOxfordWord) {
        if (err) { console.log(err); return next(err); }
        if (theOxfordWord.length > 0) {
            console.log('Retrieve from local DB');
            req.body.dic_content = theOxfordWord[0].data.replace(/\"/g, '"');
            res.send(req.body);
        } else {
            console.log('Retrieve from Oxford');
            var config = {
                app_id : oxford_app_id,
                app_key : oxford_app_key,
                source_lang : "en"
            };  
          
            var dict = new OxfordDictionary(config);
            
            var lookup = dict.thesaurus(req.body.word);
        
            lookup.then(function(data) {
                console.log('parse result ->'+JSON.stringify(data));
                req.body.dic_content = JSON.stringify(data);
                createOxfordWord(req.body.word, 'thesaurus', req.body.dic_content, '');
                res.send(req.body);
            },
            function(err) {
                console.log('req.query.word:'+req.body.word+'     story_oxford_ajaxt err:'+err); 
                return next(err);
            });

        }
    });
    
};

exports.story_oxford_ajaxs = function(req, res, next) {
    
    console.log('story_oxford_ajaxs start -> query:'+req.body.word);
    
    OxfordWord.find({title: req.body.word, gubun: 'sentences'}).exec( function (err,theOxfordWord) {
        if (err) { console.log(err); return next(err); }
        if (theOxfordWord.length > 0) {
            console.log('Retrieve from local DB');
            req.body.dic_content = theOxfordWord[0].data.replace(/\"/g, '"');
            res.send(req.body);
        } else {
            console.log('Retrieve from Oxford');
            var config = {
                app_id : oxford_app_id,
                app_key : oxford_app_key,
                source_lang : "en"
            };  
          
            var dict = new OxfordDictionary(config);
            
            var lookup = dict.sentences(req.body.word);
        
            lookup.then(function(data) {
                console.log('parse result ->'+JSON.stringify(data));
                req.body.dic_content = JSON.stringify(data);
                createOxfordWord(req.body.word, 'sentences', req.body.dic_content, '');
                res.send(req.body);
            },
            function(err) {
                console.log('req.query.word:'+req.body.word+'     story_oxford_ajaxs err:'+err); 
                return next(err);
            });

        }
    });
    
};

exports.story_word_datatable = function (req, res, next) {
    var searchWord = '';
    if(typeof req.query.searchWord != 'undefined') {
        searchWord = req.query.searchWord;
    }
    var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
    res.render('story_word_list', { title: 'Story Word List', hostname: req.headers.host, pc: pc, cfnt: req.session.cfnt, searchWord: searchWord });
};

function getSorts(query) {
    var sortables;
    if (query.order[0].column == '2') {
        sortables = { btitle: query.order[0].dir };
    } else if (query.order[0].column == '3') {
        sortables = { title: query.order[0].dir };
    } else {
        sortables = { create_date: 'desc' };
    }
    
    return sortables;
}

exports.story_word_datatable_list = function (req, res, next) {
    console.log('req.body.action:'+req.body.action);
    console.log('req.body:'+JSON.stringify(req.body));
    var searchWord = '';
    if(req.body.searchWord != '') {
        var regex = new RegExp(req.body.searchWord, "i");
        searchWord = { user: { $in: [req.session.userId]}, content: { $regex: '.*' + req.body.searchWord + '.*' } };
    }
    var sortables = getSorts(req.body);
    console.log('sortables:'+JSON.stringify(sortables));
    var searchStr = req.body.search.value;
    
    var recordsTotal = 0;
    var recordsFiltered = 0;
    if (req.body.search.value) {
        var regex = new RegExp(req.body.search.value, "i");
        searchStr = { user: { $in: [req.session.userId]}, content: { $regex: '.*' + req.body.search.value + '.*' } };
    } else {
        searchStr = searchWord;
    }
    var list_words = [];
    Story.count({user: { $in: [req.session.userId]}}, function (err, c) {
        recordsTotal = c;
        console.log('recordsTotal:'+c);
        Story.count(searchStr, function (err, c) {
            if (err) { console.log(err); return next(err); }
            recordsFiltered = c;
            //console.log('recordsFiltered:'+c);console.log('start:'+req.body.start);console.log('length:'+req.body.length);
            var start = Number(req.body.start);
            var length = Number(req.body.length);
            if(length == -1) length = 1000000;
            Story.find(searchStr)
                .skip(start).limit(length).sort(sortables)
                .lean().populate({ path: 'book', select: '_id title' })
                .exec(function (err, list_stories) {
                    if (err) { return next(err); }
                    for (let i = 0; i < list_stories.length; i++) {
                        list_stories[i].rownum = start + i + 1;
                        if(list_stories[i].create_date != null){
                            list_stories[i].create_date = moment(list_stories[i].create_date).format('YYYY-MM-DD');
                        }
                        list_stories[i].title = entities.decode(list_stories[i].title);
                        if (list_stories[i].btitle != null) {
                            list_stories[i].btitle = entities.decode(list_stories[i].btitle);
                        }
                        var book;
                        if (list_stories[i].book != null && list_stories[i].book.title != null) {
                            book = {_id: list_stories[i].book._id, title: list_stories[i].book.title};
                        } else {
                            book = {};
                        }
                        var feed = {rownum: list_stories[i].rownum, _id: list_stories[i]._id, title: list_stories[i].title, create_date: list_stories[i].create_date, book: book, btitle: list_stories[i].btitle, sentence: 'sample sentence'};
                        list_words.push(feed);
                        //string-strip-html
                    }
                    
                    console.log('list_words:\n'+JSON.stringify(list_words)+'\n\n');
                    var data = JSON.stringify({
                        "draw": req.body.draw,
                        "recordsFiltered": recordsFiltered,
                        "recordsTotal": recordsTotal,
                        "data": list_words
                    });
                    res.send(data);
            });
        });
    });
};