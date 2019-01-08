var Word = require('../models/word');
var moment = require('moment');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

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

        // Create a Word object with escaped and trimmed data.
        var word = new Word(
          { title: req.body.title,
            user: req.session.userId,
            story: req.body.story_id,
            content: req.body.content,
            skill: req.body.skill,
            importance: req.body.importance,
            create_date: [{user: req.session.userId, c_date: Date.now()}]
           });

        //Word.find({user: req.session.userId, story: req.body.story_id, title: req.body.title})
        Word.find({story: req.body.story_id, title: req.body.title})
           .exec(function (err, results) {
             //console.log(results);
             if (results.length > 0) { // No results.
                 console.log('already exists');
                 res.send(req.body);
             } else {
                 console.log('word_create_post');
                 word.save(function (err, theWord) {
                    if (err) { console.log(err); return next(err); }
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
    var newWord = new Word(
        { title: req.body.title,
          user: req.session.userId,
          story: req.body.story_id,
          content: req.body.content,
          skill: req.body.skill,
          importance: req.body.importance,
          create_date: [{user: req.session.userId, c_date: Date.now()}]
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
                    content: req.body.content,
                    skill: req.body.skill,
                    importance: req.body.importance,
                    $addToSet: {create_date: {user: req.session.userId, c_date: Date.now()}}
                }, function(err, upWord) {
                    if (err) { console.log(err); return next(err); }
                });
            }
            req.body.id = theWord._id;
            res.send(req.body);
            /*
            if (theWord.user == req.session.userId) {
                Word.findByIdAndUpdate(req.body.id, word, {}, function (err) {
                    if (err) { console.log(err); return next(err); }
                    res.send(req.body);
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
            */
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