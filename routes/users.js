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
  return res.render('registration_form', { title: 'Sign Up' });
});

// POST request for registrating User.
router.post('/registration', user_controller.registration_post);

router.get('/verifyemail', user_controller.verifyemail);

module.exports = router;
