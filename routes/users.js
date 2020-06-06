var express = require('express');
var router = express.Router();
var mid = require('../middleware');


// Require our controllers.
var user_controller = require('../controllers/userController');

// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
  return res.render('login_form', { title: 'Log In'});
});

// POST request for creating User.
router.post('/login', user_controller.login_post);

// POST request for creating User.
router.post('/login_app', user_controller.login_app);

router.post('/alter_password_post', user_controller.alter_password_post);

router.post('/alter_name_post', user_controller.alter_name_post);

router.post('/alter_font_post', user_controller.alter_font_post);

router.get('/forgot_password', function(req, res, next) {
  return res.render('forgot_password', { hostname: req.headers.host });
});

router.post('/forgot_password', user_controller.forgot_password);

// GET /logout
router.get('/logout', function(req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if(err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// GET /register
router.get('/registration', mid.loggedOut, function(req, res, next) {
  return res.render('registration_form', { title: 'Sign Up', hostname: req.headers.host });
});

// POST request for registrating User.
router.post('/registration', user_controller.registration_post);

router.get('/vqmP5Qs9n2FwE5s7IB1m', mid.loggedOut, function(req, res, next) {
  return res.render('rgst_form', { title: 'Sign Up', hostname: req.headers.host });
});

router.post('/vqmP5Qs9n2FwE5s7IB1m', user_controller.rgst_post);

router.post('/gidcheck', user_controller.gidcheck);

router.post('/emailcheck', user_controller.emailcheck);

router.get('/verifyemail', user_controller.verifyemail);

module.exports = router;
