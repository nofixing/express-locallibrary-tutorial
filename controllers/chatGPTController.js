var ChatGPT = require('../models/chatGPT');

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

// Display list of all chatGPTs.
exports.chatGPT_list = function (req, res, next) {
  ChatGPT.find(
    { user: req.session.userId },
    { story: req.params.story_id },
    'title '
  ).exec(function (err, list_chatGPTs) {
    if (err) {
      return next(err);
    }
    // Successful, so render
    var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP' : '';
    res.render('chatGPT_list', {
      title: 'ChatGPT List',
      chatGPT_list: list_chatGPTs,
      pc: pc,
    });
  });
};

// Display detail page for a specific chatGPT.
exports.chatGPT_detail = function (req, res, next) {
  async.parallel(
    {
      chatGPT: function (callback) {
        ChatGPT.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.chatGPT == null) {
        // No results.
        var eor = new Error('ChatGPT not found');
        eor.status = 404;
        return next(eor);
      }
      // Successful, so render.
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP' : '';
      res.render('chatGPT_detail', {
        title: 'Title',
        chatGPT: results.chatGPT,
        pc: pc,
      });
    }
  );
};

exports.chatGPT_iframe = function (req, res, next) {
  async.parallel(
    {
      chatGPT: function (callback) {
        ChatGPT.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.chatGPT == null) {
        // No results.
        var eor = new Error('ChatGPT not found');
        eor.status = 404;
        return next(eor);
      }
      // Successful, so render.
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP' : '';
      res.render('chatGPT_iframe', { chatGPT: results.chatGPT, pc: pc });
    }
  );
};

// Display chatGPT create form on GET.
exports.chatGPT_create_get = function (req, res, next) {
  res.render('chatGPT_form', { title: 'Create ChatGPT' });
};

// Handle chatGPT create on POST.
exports.chatGPT_create_post = [
  // Process request after validation and sanitization.
  (req, res, next) => {
    if (req.body.story_user != req.session.userId) {
      return next();
    }
    var chatGPT;
    console.log('req.body.chatGPT_id:' + req.body.chatGPT_id);
    if (req.body.chatGPT_id.length > 0) {
      console.log('ChatGPT Update call');
      chatGPT = new ChatGPT({
        _id: req.body.chatGPT_id,
        user: req.session.userId,
        story: req.body.story_id,
        content: req.body.content,
      });
      ChatGPT.findByIdAndUpdate(
        req.body.chatGPT_id,
        chatGPT,
        {},
        function (err) {
          if (err) {
            console.log(err);
            return next(err);
          }
          // Successful - redirect to chatGPT detail page.
          res.send(req.body);
        }
      );
    } else {
      chatGPT = new ChatGPT({
        user: req.session.userId,
        story: req.body.story_id,
        content: req.body.content,
      });
      chatGPT.save(function (err, theChatGPT) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new chatGPT record.
        //res.redirect(chatGPT.url);
        //console.log('chatGPT insert success');
        //return next();
        req.body.chatGPT_id = theChatGPT.id;
        console.log('theChatGPT.id:' + theChatGPT.id);
        res.send(req.body);
      });
    }
  },
];

// Display chatGPT delete form on GET.
exports.chatGPT_delete_get = function (req, res, next) {
  async.parallel(
    {
      chatGPT: function (callback) {
        ChatGPT.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.chatGPT == null) {
        // No results.
        res.redirect('/catalog/chatGPTs');
      }
      // Successful, so render.
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP' : '';
      res.render('chatGPT_delete', {
        title: 'Delete ChatGPT',
        chatGPT: results.chatGPT,
        pc: pc,
      });
    }
  );
};

// Handle chatGPT delete on POST.
exports.chatGPT_delete_post = function (req, res, next) {
  // Assume the post has valid id (ie no validation/sanitization).

  async.parallel(
    {
      chatGPT: function (callback) {
        ChatGPT.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      // Success
      // Delete object and redirect to the list of chatGPTs.
      ChatGPT.findByIdAndRemove(req.body.id, function deleteChatGPT(err) {
        if (err) {
          return next(err);
        }
        // Success - got to chatGPTs list.
        res.redirect('/catalog/chatGPTs');
      });
    }
  );
};

// Display chatGPT update form on GET.
exports.chatGPT_update_get = function (req, res, next) {
  // Get chatGPT, authors and genres for form.
  async.parallel(
    {
      chatGPT: function (callback) {
        ChatGPT.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.chatGPT == null) {
        // No results.
        var eor = new Error('ChatGPT not found');
        eor.status = 404;
        return next(eor);
      }
      // Success.
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP' : '';
      res.render('chatGPT_form', {
        title: 'Update ChatGPT',
        chatGPT: results.chatGPT,
        pc: pc,
      });
    }
  );
};

// Handle chatGPT update on POST.
exports.chatGPT_update_post = [
  // Validate fields.
  body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),

  // Sanitize fields.
  sanitizeBody('title').trim().escape(),
  sanitizeBody('content').trim().escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a ChatGPT object with escaped/trimmed data and old id.
    var chatGPT = new ChatGPT({
      title: req.body.title,
      user: req.session.userId,
      story: req.body.story_id,
      content: req.body.content,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      var pc = req.device.type.toUpperCase() == 'DESKTOP' ? 'DESKTOP' : '';
      res.render('chatGPT_form', {
        title: 'Update ChatGPT',
        chatGPT: chatGPT,
        errors: errors.array(),
        pc: pc,
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      ChatGPT.findByIdAndUpdate(
        req.params.id,
        chatGPT,
        {},
        function (err, ChatGPT) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to chatGPT detail page.
          res.redirect(ChatGPT.url);
        }
      );
    }
  },
];
