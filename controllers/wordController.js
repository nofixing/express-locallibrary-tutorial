var Word = require('../models/word');
var moment = require('moment');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
//const {Translate} = require('@google-cloud/translate');

// Your Google Cloud Platform project ID
const projectId = 'infinitestorlet';

// Instantiates a client
/*
const translate = new Translate({
  projectId: projectId,
  credentials: {
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL
  }
});
*/

var client_id = 'BdLjzx4yosbmSqFb4feb';
var client_secret = 'GskGpbVB1L';

const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

var async = require('async');

// Display list of all words.
exports.word_list = function(req, res, next) {

  Word.find({user: { $in: [req.session.userId]}}, {story: req.params.story_id}, 'title ')
    .exec(function (err, list_words) {
      if (err) { return next(err); }
      // Successful, so render
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
      res.render('word_list', { title: 'Word List', word_list:  list_words, pc: pc});
    });

};

// Display list of all words.
exports.words = function(req, res, next) {
    console.log(req.session.userId+"/"+req.query.story_id);
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

        //Word.find({user: req.session.userId, story: req.body.story_id, title: req.body.title})
        Word.find({story: req.body.story_id, title: req.body.title})
           .exec(function (err, results) {
             //console.log(results);
             if (results.length > 0) { // No results.
                 console.log('already exists');
                 res.send(req.body);
             } else {
                 console.log('word_create_post');
                 
                var translation = '';
                
                /*
                translate.translate(req.body.title, 'ko').then(results => {
                    translation = results[0];
                    console.log(`Translation: ${translation}`);
                */ 
                
               var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
               var request = require('request');
               var options = {
                   url: api_url,
                   form: {'source':'en', 'target':'ko', 'text':req.body.title},
                   headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
                };
               request.post(options, function (error, response, body) {
                 if (!error && response.statusCode == 200) {
                   //res.writeHead(200, {'Content-Type': 'text/json;charset=utf-8'});
                   //res.end(body);
                   //console.log(`Translation json: ${body}`);
                   var json = JSON.parse(body);
                   console.log(json.message.result.translatedText);
                   translation = json.message.result.translatedText;
                 } else {
                   //res.status(response.statusCode).end();
                   console.log('error = ' + response.statusCode);
                 }
               });

                    // Create a Word object with escaped and trimmed data.
                    var word = new Word(
                        { title: req.body.title,
                        user: req.session.userId,
                        story: req.body.story_id,
                        book: req.body.book_id,
                        story_title: req.body.story_title,
                        book_title: req.body.book_title,
                        content: translation,
                        skill: req.body.skill,
                        importance: req.body.importance,
                        create_date: Date.now()
                        });
                    console.log('word.content:'+word.content);
                    word.save(function (err, theWord) {
                        if (err) { console.log(err); return next(err); }
                            // Successful - redirect to new word record.
                            //res.redirect(word.url);
                            req.body.word_id = theWord._id;
                            req.body.content = translation;
                            res.send(req.body);
                        });
                
                /*
                }).catch(err => {
                    console.error('ERROR:', err);
                    res.send(req.body);
                });
                */
                
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

    console.log('book_id:'+req.body.book_id);
    var book_id = req.body.book_id;
    if(book_id == '') book_id = '000000000000000000000000';
    var newWord = new Word(
        { title: req.body.title,
          user: req.session.userId,
          story: req.body.story_id,
          book: book_id,
          story_title: req.body.story_title,
          book_title: req.body.book_title,
          content: req.body.content,
          skill: req.body.skill,
          importance: req.body.importance,
          create_date: Date.now()
         });
    //console.log('word update start');
    Word.findById({_id: req.body.id})
        .exec(function (err, theWord) {
          //console.log(theWord);
          if (theWord != null) {
            var upYn = 'N';
            for (let i = 0; i < theWord.user.length; i++) {
                if (theWord.user[i] == req.session.userId) {
                    console.log('Word.update 1');
                    Word.update({_id: req.body.id}, {
                        title: req.body.title,
                        story: req.body.story_id,
                        book: book_id,
                        story_title: req.body.story_title,
                        book_title: req.body.book_title,
                        content: req.body.content,
                        skill: req.body.skill,
                        importance: req.body.importance
                    }, function(err, upWord) {
                        if (err) { console.log(err); return next(err); }
                    });
                    upYn = 'Y';
                    break;
                }
            }
            if (upYn == 'N') {
                console.log('Word.update 2');
                Word.update({_id: req.body.id}, {
                    title: req.body.title,
                    $push: {user: req.session.userId},
                    story: req.body.story_id,
                    book: book_id,
                    story_title: req.body.story_title,
                    book_title: req.body.book_title,
                    content: req.body.content,
                    skill: req.body.skill,
                    importance: req.body.importance
                }, function(err, upWord) {
                    if (err) { console.log(err); return next(err); }
                });
            }
            req.body.id = theWord._id;
            res.send(req.body);
          } else {
              console.log('word_update_post new insert');
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

// Handle word update on POST.
exports.word_update_imgAddr_post = function(req, res, next) {

    var word = new Word(
      { image_address: req.body.image_address,
        _id:req.body.id // This is required, or a new ID will be assigned!
       });
    Word.findByIdAndUpdate(req.body.id, word, {}, function (err) {
        if (err) { console.log(err); return next(err); }
        res.send(req.body);
    });

};

exports.word_datatable = function (req, res, next) {
    var book_id = '';
    if(typeof req.query.book_id != 'undefined') {
        book_id = req.query.book_id;
    }
    var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
    res.render('word_board_list', { title: 'Word List', hostname: req.headers.host, pc: pc, cfnt: req.session.cfnt, book_id: book_id });

};

function getSorts(query) {
    var sortables;
    if (query.order[0].column == '1') {
        sortables = { title: query.order[0].dir };
    } else if (query.order[0].column == '2') {
        sortables = { content: query.order[0].dir };
    } else if (query.order[0].column == '3') {
        sortables = { book_title: query.order[0].dir };
    } else if (query.order[0].column == '4') {
        sortables = { story_title: query.order[0].dir };
    } else if (query.order[0].column == '5') {
        sortables = { skill: query.order[0].dir };
    } else if (query.order[0].column == '6') {
        sortables = { importance: query.order[0].dir };
    } else if (query.order[0].column == '7') {
        sortables = { create_date: query.order[0].dir };
    } else {
        sortables = { create_date: 'desc' };
    }
    
    return sortables;
}

exports.word_datatable_list = function (req, res, next) {
    console.log('req.body.action:'+req.body.action);
    console.log('req.body:'+JSON.stringify(req.body));
    if(typeof req.body.action == 'undefined') {
        var book_id = '';
        if(req.body.book_id != '') {
            book_id = {user: { $in: [req.session.userId]}, book: req.body.book_id};
        }
        console.log('book_id:'+JSON.stringify(book_id));
        var sortables = getSorts(req.body);
        console.log('sortables:'+JSON.stringify(sortables));
        var searchStr = req.body.search.value;
        

        var recordsTotal = 0;
        var recordsFiltered = 0;
        if(book_id != '') {
            console.log('We are here:');
            if (req.body.search.value) {
                var regex = new RegExp(req.body.search.value, "i");
                searchStr = {
                    user: { $in: [req.session.userId]}, book: req.body.book_id,
                    $or: [{
                        'title': { $regex: '.*' + req.body.search.value + '.*' }
                    }, {
                        'content': { $regex: '.*' + req.body.search.value + '.*' }
                    }, {
                        'book_title': { $regex: '.*' + req.body.search.value + '.*' }
                    }, {
                        'story_title': { $regex: '.*' + req.body.search.value + '.*' }
                    }]
                };
            } else {
                searchStr = book_id;
            }

            Word.count(book_id, function (err, c) {
                recordsTotal = c;
                console.log('recordsTotal:'+c);
                Word.count(searchStr, function (err, c) {
                    if (err) { console.log(err); return next(err); }
                    recordsFiltered = c;
                    //console.log('recordsFiltered:'+c);console.log('start:'+req.body.start);console.log('length:'+req.body.length);
                    var start = Number(req.body.start);
                    var length = Number(req.body.length);
                    if(length == -1) length = 1000000;
                    Word.find(searchStr)
                        .skip(start).limit(length).sort(sortables)
                        .lean().populate({ path: 'story', select: '_id title' }).populate({ path: 'book', select: '_id title' })
                        .exec(function (err, list_words) {
                            if (err) { return next(err); }
                            for (let i = 0; i < list_words.length; i++) {
                                list_words[i].rownum = start + i + 1;
                                if(list_words[i].create_date != null){
                                    list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                                }
                                if (list_words[i].story != null && list_words[i].story.title != null) {
                                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                                }
                                if (list_words[i].story_title != null && list_words[i].story_title != null) {
                                    list_words[i].story_title = entities.decode(list_words[i].story_title);
                                }
                                if (list_words[i].book_title != null && list_words[i].book_title != null) {
                                    list_words[i].book_title = entities.decode(list_words[i].book_title);
                                }
                            }
                            //console.log('list_words:'+JSON.stringify(list_words));
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
        } else {

            if (req.body.search.value) {
                var regex = new RegExp(req.body.search.value, "i");
                searchStr = {
                    user: { $in: [req.session.userId]},
                    $or: [{
                        'title': { $regex: '.*' + req.body.search.value + '.*' }
                    }, {
                        'content': { $regex: '.*' + req.body.search.value + '.*' }
                    }, {
                        'book_title': { $regex: '.*' + req.body.search.value + '.*' }
                    }, {
                        'story_title': { $regex: '.*' + req.body.search.value + '.*' }
                    }]
                };
            } else {
                searchStr = {user: { $in: [req.session.userId]}};
            }

            Word.count({user: { $in: [req.session.userId]}}, function (err, c) {
                recordsTotal = c;
                console.log('recordsTotal:'+c);
                Word.count(searchStr, function (err, c) {
                    if (err) { console.log(err); return next(err); }
                    recordsFiltered = c;
                    //console.log('recordsFiltered:'+c);console.log('start:'+req.body.start);console.log('length:'+req.body.length);
                    var start = Number(req.body.start);
                    var length = Number(req.body.length);
                    if(length == -1) length = 1000000;
                    Word.find(searchStr)
                        .skip(start).limit(length).sort(sortables)
                        .lean().populate({ path: 'story', select: '_id title' }).populate({ path: 'book', select: '_id title' })
                        .exec(function (err, list_words) {
                            if (err) { return next(err); }
                            for (let i = 0; i < list_words.length; i++) {
                                list_words[i].rownum = start + i + 1;
                                if(list_words[i].create_date != null){
                                    list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                                }
                                if (list_words[i].story != null && list_words[i].story.title != null) {
                                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                                }
                                if (list_words[i].story_title != null && list_words[i].story_title != null) {
                                    list_words[i].story_title = entities.decode(list_words[i].story_title);
                                }
                                if (list_words[i].book_title != null && list_words[i].book_title != null) {
                                    list_words[i].book_title = entities.decode(list_words[i].book_title);
                                }
                            }
                            //console.log('list_words:'+JSON.stringify(list_words));
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
        }
    } else if (req.body.action == 'edit') {
        console.log('req.body.data:'+JSON.stringify(req.body.data));
        var obj = req.body.data, kyz = Object.keys(obj);
        console.log('key:'+kyz[0]);
        //console.log('req.body.data.title:'+JSON.stringify(obj[kyz[0]]));
        console.log('req.body.data.title:'+obj[kyz[0]].title);
        console.log('req.body.data.story_title:'+obj[kyz[0]].story_title);
        console.log('req.body.data.create_date:'+obj[kyz[0]].create_date);
        Word.update({_id: kyz}, {
            title: obj[kyz[0]].title,
            content: obj[kyz[0]].content,
            skill: obj[kyz[0]].skill,
            importance: obj[kyz[0]].importance,
            create_date: new Date(obj[kyz[0]].create_date)
        }, function(err, upWord) {
            if (err) { console.log(err); return next(err); }
            var theWord = [{
                "_id": kyz[0],
                "title": obj[kyz[0]].title,
                "content": obj[kyz[0]].content,
                "skill": obj[kyz[0]].skill,
                "importance": obj[kyz[0]].importance,
                "create_date": obj[kyz[0]].create_date
            }];
            var data = JSON.stringify({
                "action": "edit",
                "data": theWord
            });
            console.log('upWord:'+data);
            res.send(data);
        });
    } else if (req.body.action == 'remove') {
        console.log('req.body.data:'+JSON.stringify(req.body.data));
        var obj = req.body.data, kyz = Object.keys(obj);
        Word.findByIdAndRemove(kyz[0], function deleteWord(err) {
            if (err) { console.log(err); return next(err); }
            var theWord = [{
                "_id": kyz[0],
                "title": obj[kyz[0]].title,
                "content": obj[kyz[0]].content,
                "skill": obj[kyz[0]].skill,
                "importance": obj[kyz[0]].importance,
                "create_date": obj[kyz[0]].create_date
            }];
            var data = JSON.stringify({
                "action": "remove",
                "data": theWord
            });
            console.log('removeWord:'+data);
            res.send(data);
        });
    }
};

exports.word_board_list = function(req, res, next) {
    console.log("Server side word_board_list called.");
    var mxcnt = 0;
    if(typeof req.body.mxcnt !='undefined') {
        mxcnt = req.body.mxcnt;
    }
    
    var ct = 0;
    if(typeof req.body.stle !='undefined' && req.body.stle != '') {
        Word.find({user: { $in: [req.session.userId]}, $or:[ {title: { $regex: '.*' + req.body.stle + '.*' }}, {content: { $regex: '.*' + req.body.stle + '.*' }}]})
            .count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}, $or:[ {title: { $regex: '.*' + req.body.stle + '.*' }}, {content: { $regex: '.*' + req.body.stle + '.*' }}]})
            .skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
            if (err) { return next(err); }
            for (let i = 0; i < list_words.length; i++) {
                list_words[i].rownum = mxcnt + i + 1;
                if(list_words[i].create_date != null){
                    for (let j = 0; j < list_words[i].create_date.length; j++) {
                        if(list_words[i].create_date[j].user == req.session.userId) {
                            list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                        }
                    }
                    //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                }
                if (list_words[i].story != null && list_words[i].story.title != null) {
                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                }
            }
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('word_board_list', { title: 'Word List', word_board_list:  list_words, hostname: req.headers.host, pc: pc, mxcnt: mxcnt+100, ct: ct, cfnt: req.session.cfnt });
        });
    } else if(typeof req.body.importance !='undefined' && req.body.importance != '' && (typeof req.body.skill =='undefined' || req.body.skill == '')) {
        Word.find({user: { $in: [req.session.userId]}, importance: req.body.importance})
            .count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}, importance: req.body.importance})
            .skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
            if (err) { return next(err); }
            for (let i = 0; i < list_words.length; i++) {
                list_words[i].rownum = mxcnt + i + 1;
                if(list_words[i].create_date != null){
                    for (let j = 0; j < list_words[i].create_date.length; j++) {
                        if(list_words[i].create_date[j].user == req.session.userId) {
                            list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                        }
                    }
                    //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                }
                if (list_words[i].story != null && list_words[i].story.title != null) {
                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                }
            }
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('word_board_list', {importance: req.body.importance, title: 'Word List', word_board_list:  list_words, hostname: req.headers.host, pc: pc, mxcnt: mxcnt+100, ct: ct, cfnt: req.session.cfnt });
        });
    } else if(typeof req.body.skill !='undefined' && req.body.skill != '' && (typeof req.body.importance =='undefined' || req.body.importance == '')) {
        Word.find({user: { $in: [req.session.userId]}, skill: req.body.skill})
            .count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}, skill: req.body.skill})
            .skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
            if (err) { return next(err); }
            for (let i = 0; i < list_words.length; i++) {
                list_words[i].rownum = mxcnt + i + 1;
                if(list_words[i].create_date != null){
                    for (let j = 0; j < list_words[i].create_date.length; j++) {
                        if(list_words[i].create_date[j].user == req.session.userId) {
                            list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                        }
                    }
                    //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                }
                if (list_words[i].story != null && list_words[i].story.title != null) {
                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                }
            }
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('word_board_list', {skill: req.body.skill, title: 'Word List', word_board_list:  list_words, hostname: req.headers.host, pc: pc, mxcnt: mxcnt+100, ct: ct, cfnt: req.session.cfnt });
        });
    } else if(typeof req.body.skill !='undefined' && req.body.skill != '' && (typeof req.body.importance !='undefined' && req.body.importance != '')) {
        Word.find({user: { $in: [req.session.userId]}, skill: req.body.skill, importance: req.body.importance})
            .count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}, skill: req.body.skill, importance: req.body.importance})
            .skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
            if (err) { return next(err); }
            for (let i = 0; i < list_words.length; i++) {
                list_words[i].rownum = mxcnt + i + 1;
                if(list_words[i].create_date != null){
                    for (let j = 0; j < list_words[i].create_date.length; j++) {
                        if(list_words[i].create_date[j].user == req.session.userId) {
                            list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                        }
                    }
                    //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                }
                if (list_words[i].story != null && list_words[i].story.title != null) {
                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                }
            }
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('word_board_list', {skill: req.body.skill, importance: req.body.importance, title: 'Word List', word_board_list:  list_words, hostname: req.headers.host, pc: pc, mxcnt: mxcnt+100, ct: ct, cfnt: req.session.cfnt });
        });
    } else {
        Word.find({user: { $in: [req.session.userId]}}).count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}}).skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
            if (err) { return next(err); }
            //console.log(list_words);
            for (let i = 0; i < list_words.length; i++) {
                list_words[i].rownum = mxcnt + i + 1;
                if(list_words[i].create_date != null){
                    for (let j = 0; j < list_words[i].create_date.length; j++) {
                        if(list_words[i].create_date[j].user == req.session.userId) {
                            list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                        }
                    }
                    //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                }
                if (list_words[i].story != null && list_words[i].story.title != null) {
                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                }
            }
            var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP':'';
            res.render('word_board_list', { title: 'Word List', word_board_list:  list_words, hostname: req.headers.host, pc: pc, mxcnt: mxcnt+100, ct: ct, cfnt: req.session.cfnt });
        });
    }
  
};

exports.word_board_ajax = function(req, res, next) {
    console.log("Server side word_board_ajax called.");
    console.log(req.body);
    var mxcnt = 0;
    if(typeof req.body.mxcnt !='undefined') {
        mxcnt = req.body.mxcnt;
    }
    mxcnt = Number(mxcnt);
    var ct = 0;
    
    if(typeof req.body.stle !='undefined' && req.body.stle != '') {
        Word.find({user: { $in: [req.session.userId]}, $or:[ {title: { $regex: '.*' + req.body.stle + '.*' }}, {content: { $regex: '.*' + req.body.stle + '.*' }}]})
            .count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}, $or:[ {title: { $regex: '.*' + req.body.stle + '.*' }}, {content: { $regex: '.*' + req.body.stle + '.*' }}]})
            .skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
                if (err) { 
                    console.log(err);
                    return next(err); 
                }
                for (let i = 0; i < list_words.length; i++) {
                    list_words[i].rownum = mxcnt + i + 1;
                    if(list_words[i].create_date != null){
                        for (let j = 0; j < list_words[i].create_date.length; j++) {
                            if(list_words[i].create_date[j].user == req.session.userId) {
                                list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                            }
                        }
                        //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                    }
                    if (list_words[i].story != null && list_words[i].story.title != null) {
                        list_words[i].story.title = entities.decode(list_words[i].story.title);
                    }
                }
                list_words.mxcnt = mxcnt+100;
                list_words.ct = ct;
                //console.log(list_words);
                res.send(list_words);
        });
    } else if(typeof req.body.importance !='undefined' && req.body.importance != '' && (typeof req.body.skill =='undefined' || req.body.skill == '')) {
        Word.find({user: { $in: [req.session.userId]}, importance: req.body.importance})
            .count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}, importance: req.body.importance})
            .skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
            if (err) { return next(err); }
            for (let i = 0; i < list_words.length; i++) {
                list_words[i].rownum = mxcnt + i + 1;
                if(list_words[i].create_date != null){
                    for (let j = 0; j < list_words[i].create_date.length; j++) {
                        if(list_words[i].create_date[j].user == req.session.userId) {
                            list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                        }
                    }
                    //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                }
                if (list_words[i].story != null && list_words[i].story.title != null) {
                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                }
            }
            list_words.mxcnt = mxcnt+100;
            list_words.ct = ct;
            //console.log(list_words);
            res.send(list_words);
        });
    } else if(typeof req.body.skill !='undefined' && req.body.skill != '' && (typeof req.body.importance =='undefined' || req.body.importance == '')) {
        Word.find({user: { $in: [req.session.userId]}, skill: req.body.skill})
            .count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}, skill: req.body.skill})
            .skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
            if (err) { return next(err); }
            for (let i = 0; i < list_words.length; i++) {
                list_words[i].rownum = mxcnt + i + 1;
                if(list_words[i].create_date != null){
                    for (let j = 0; j < list_words[i].create_date.length; j++) {
                        if(list_words[i].create_date[j].user == req.session.userId) {
                            list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                        }
                    }
                    //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                }
                if (list_words[i].story != null && list_words[i].story.title != null) {
                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                }
            }
            list_words.mxcnt = mxcnt+100;
            list_words.ct = ct;
            //console.log(list_words);
            res.send(list_words);
        });
    } else if(typeof req.body.skill !='undefined' && req.body.skill != '' && (typeof req.body.importance !='undefined' && req.body.importance != '')) {
        Word.find({user: { $in: [req.session.userId]}, skill: req.body.skill, importance: req.body.importance})
            .count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}, skill: req.body.skill, importance: req.body.importance})
            .skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
            if (err) { return next(err); }
            for (let i = 0; i < list_words.length; i++) {
                list_words[i].rownum = mxcnt + i + 1;
                if(list_words[i].create_date != null){
                    for (let j = 0; j < list_words[i].create_date.length; j++) {
                        if(list_words[i].create_date[j].user == req.session.userId) {
                            list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                        }
                    }
                    //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                }
                if (list_words[i].story != null && list_words[i].story.title != null) {
                    list_words[i].story.title = entities.decode(list_words[i].story.title);
                }
            }
            list_words.mxcnt = mxcnt+100;
            list_words.ct = ct;
            //console.log(list_words);
            res.send(list_words);
        });
    } else {
        Word.find({user: { $in: [req.session.userId]}}).count().exec(function (err, count) {
            ct =count;
        });
        Word.find({user: { $in: [req.session.userId]}}).skip(mxcnt).limit(mxcnt+100).sort({create_date: -1, order: 1})
            .lean().populate({ path: 'story', select: '_id title' })
            .exec(function (err, list_words) {
                if (err) { 
                    console.log(err);
                    return next(err); 
                }
                for (let i = 0; i < list_words.length; i++) {
                    list_words[i].rownum = mxcnt + i + 1;
                    if(list_words[i].create_date != null){
                        for (let j = 0; j < list_words[i].create_date.length; j++) {
                            if(list_words[i].create_date[j].user == req.session.userId) {
                                list_words[i].cdate = moment(list_words[i].create_date[j].c_date).format('YYYY-MM-DD');
                            }
                        }
                        //list_words[i].create_date = moment(list_words[i].create_date).format('YYYY-MM-DD');
                    }
                    if (list_words[i].story != null && list_words[i].story.title != null) {
                        list_words[i].story.title = entities.decode(list_words[i].story.title);
                    }
                }
                list_words.mxcnt = mxcnt+100;
                list_words.ct = ct;
                //console.log(list_words);
                res.send(list_words);
        });
    }
  
};
