var express = require('express');
var router = express.Router();
var mid = require('../middleware');

// Require our controllers.
var book_controller = require('../controllers/bookController');
var story_controller = require('../controllers/storyController');
var comment_controller = require('../controllers/commentController');
var word_controller = require('../controllers/wordController');
var memo_controller = require('../controllers/memoController');
var author_controller = require('../controllers/authorController');
var genre_controller = require('../controllers/genreController');
var book_instance_controller = require('../controllers/bookinstanceController');
var user_controller = require('../controllers/userController');


router.all('/story/*', mid.requiresLogin, function(req, res, next) {
    next();
});

router.all('/stories/*', mid.requiresLogin, function(req, res, next) {
    next();
});

router.all('/book/*', mid.requiresLogin, function(req, res, next) {
    next();
});

router.all('/genre/*', mid.requiresLogin, function(req, res, next) {
    next();
});

router.all('/*', function(req, res, next) {
    if (req.session && req.session.userId) {
        res.locals.user = true;
    }
    next();
});

/// BOOK ROUTES ///

// GET catalog home page.
router.get('/', book_controller.index); 

router.get('/alter_password', user_controller.alter_password_get);

router.get('/alter_name', user_controller.alter_name_get);

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/book/create', book_controller.book_create_get);

// POST request for creating Book.
router.post('/book/create', book_controller.book_create_post);

// GET request to delete Book.
router.get('/book/:id/delete', book_controller.book_delete_get);

// POST request to delete Book.
router.post('/book/:id/delete', book_controller.book_delete_post);

// GET request to update Book.
router.get('/book/:id/update', book_controller.book_update_get);

// POST request to update Book.
router.post('/book/:id/update', book_controller.book_update_post);

// GET request for one Book.
router.get('/book/:id', book_controller.book_detail);

// GET request for list of all Book.
router.get('/books', book_controller.book_list);

router.post('/book_ajax', book_controller.book_ajax);

router.get('/book_board_list', book_controller.book_datatable);

router.post('/book_board_list', book_controller.book_datatable_list);

/// STORY ROUTES ///

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/story/create', story_controller.story_create_get);

// POST request for creating Book.
router.post('/story/create', story_controller.story_create_post);

// GET request to delete Book.
router.get('/story/:id/delete', story_controller.story_delete_get);

router.get('/story/:id/download', story_controller.download_get);

// POST request to delete Book.
router.post('/story/:id/delete', story_controller.story_delete_post);

// GET request to update Book.
router.get('/story/:id/update', story_controller.story_update_get);

// POST request to update Book.
router.post('/story/:id/update', story_controller.story_update_post);

// GET request for one Book.
router.get('/story/:id', story_controller.story_detail);
router.post('/story/:id', story_controller.story_detail);

router.get('/story/:id/iframe', story_controller.story_iframe);

// GET request for list of all Book.
router.get('/stories', story_controller.story_list);

router.get('/story_open_list', story_controller.story_open_list);

router.post('/story_open_list', story_controller.story_open_list);

router.post('/story_open_ajax', story_controller.story_open_ajax);

router.post('/stories_ajax', story_controller.story_list_ajax);

router.post('/story_favs_ajax', story_controller.favs_ajax);

router.post('/story_bookMark_ajax', story_controller.bookMark_ajax);

router.post('/preview', story_controller.story_preview);

router.post('/story/:id/preview', story_controller.story_update_preview);

router.post('/story/:id/comments/replies', comment_controller.comment_create_post);

router.post('/story/:id/comments/:commentId/replies', comment_controller.comment_create_post2);

router.post('/story/:id/comments/:commentId/replies_update', comment_controller.comment_update_post);

router.get('/story_oxford', story_controller.story_oxford);

router.post('/story_oxford_ajax', story_controller.story_oxford_ajax);

router.post('/story_oxford_ajaxt', story_controller.story_oxford_ajaxt);

router.post('/story_oxford_ajaxs', story_controller.story_oxford_ajaxs);

router.get('/story_word_datatable', story_controller.story_word_datatable);

router.post('/story_word_datatable_list', story_controller.story_word_datatable_list);

router.get('/stories/withdrawal', story_controller.withdrawal);

router.get('/privacy_policy', story_controller.privacy_policy);

/// WORD ROUTES ///

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/word/create', word_controller.word_create_get);

// POST request for creating Book.
router.post('/word/create', word_controller.word_create_post);

router.post('/word/translate', word_controller.word_translate_post);

// GET request to delete Book.
router.get('/word/:id/delete', word_controller.word_delete_get);

// POST request to delete Book.
router.post('/word/delete', word_controller.word_delete_post);

// GET request to update Book.
router.get('/word/:id/update', word_controller.word_update_get);

// POST request to update Book.
router.post('/word/update', word_controller.word_update_post);

// POST request to update Book.
router.post('/word/updateImgAddr', word_controller.word_update_imgAddr_post);

router.get('/word/:id', word_controller.word_detail);

router.get('/word_popup', word_controller.word_popup);

router.post('/word_popup', word_controller.word_popup_post);

router.post('/wrdSave', word_controller.wrdSave);

router.get('/word/:id/iframe', word_controller.word_iframe);

// GET request for list of all Book.
router.get('/words', word_controller.word_list);

// GET request for list of all Book.
router.get('/word_list', word_controller.words);

//router.get('/word_board_list', word_controller.word_board_list);

//router.post('/word_board_list', word_controller.word_board_list);

router.get('/word_board_list', word_controller.word_datatable);

router.post('/word_board_list', word_controller.word_datatable_list);

router.post('/word_board_ajax', word_controller.word_board_ajax);

/// MEMO ROUTES ///

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get('/memo/create', memo_controller.memo_create_get);

// POST request for creating Book.
router.post('/memo/create', memo_controller.memo_create_post);

// GET request to delete Book.
router.get('/memo/:id/delete', memo_controller.memo_delete_get);

// POST request to delete Book.
router.post('/memo/:id/delete', memo_controller.memo_delete_post);

// GET request to update Book.
router.get('/memo/:id/update', memo_controller.memo_update_get);

// POST request to update Book.
router.post('/memo/:id/update', memo_controller.memo_update_post);

// GET request for one Book.
router.get('/memo/:id', memo_controller.memo_detail);

router.get('/memo/:id/iframe', memo_controller.memo_iframe);

// GET request for list of all Book.
router.get('/memos', memo_controller.memo_list);

/// AUTHOR ROUTES ///

// GET request for creating Author. NOTE This must come before route for id (i.e. display author).
router.get('/author/create', author_controller.author_create_get);

// POST request for creating Author.
router.post('/author/create', author_controller.author_create_post);

// GET request to delete Author.
router.get('/author/:id/delete', author_controller.author_delete_get);

// POST request to delete Author
router.post('/author/:id/delete', author_controller.author_delete_post);

// GET request to update Author.
router.get('/author/:id/update', author_controller.author_update_get);

// POST request to update Author.
router.post('/author/:id/update', author_controller.author_update_post);

// GET request for one Author.
router.get('/author/:id', author_controller.author_detail);

// GET request for list of all Authors.
router.get('/authors', author_controller.author_list);


/// GENRE ROUTES ///

// GET request for creating a Genre. NOTE This must come before route that displays Genre (uses id).
router.get('/genre/create', genre_controller.genre_create_get);

// POST request for creating Genre.
router.post('/genre/create', genre_controller.genre_create_post);

// GET request to delete Genre.
router.get('/genre/:id/delete', genre_controller.genre_delete_get);

// POST request to delete Genre.
router.post('/genre/:id/delete', genre_controller.genre_delete_post);

// GET request to update Genre.
router.get('/genre/:id/update', genre_controller.genre_update_get);

// POST request to update Genre.
router.post('/genre/:id/update', genre_controller.genre_update_post);

// GET request for one Genre.
router.get('/genre/:id', genre_controller.genre_detail);

// GET request for list of all Genre.
router.get('/genres', genre_controller.genre_list);


/// BOOKINSTANCE ROUTES ///

// GET request for creating a BookInstance. NOTE This must come before route that displays BookInstance (uses id).
router.get('/bookinstance/create', book_instance_controller.bookinstance_create_get);

// POST request for creating BookInstance.
router.post('/bookinstance/create', book_instance_controller.bookinstance_create_post);

// GET request to delete BookInstance.
router.get('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_get);

// POST request to delete BookInstance.
router.post('/bookinstance/:id/delete', book_instance_controller.bookinstance_delete_post);

// GET request to update BookInstance.
router.get('/bookinstance/:id/update', book_instance_controller.bookinstance_update_get);

// POST request to update BookInstance.
router.post('/bookinstance/:id/update', book_instance_controller.bookinstance_update_post);

// GET request for one BookInstance.
router.get('/bookinstance/:id', book_instance_controller.bookinstance_detail);

// GET request for list of all BookInstance.
router.get('/bookinstances', book_instance_controller.bookinstance_list);


module.exports = router;
