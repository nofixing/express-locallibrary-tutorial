var User = require('../models/user');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

var async = require('async');

exports.logout = function(req, res, next) {

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

};

exports.login_post = function(req, res, next) {

    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function (error, user) {
          if (error || !user) {
            var err = new Error('Wrong email or password.');
            err.status = 401;
            return next(err);
          }  else {
            req.session.userId = user._id;
            return res.redirect('/');
          }
        });
      } else {
        var err = new Error('Email and password are required.');
        err.status = 401;
        return next(err);
    }

};

exports.registration_post = function(req, res, next) {

    if (req.body.email &&
        req.body.name &&
        req.body.password &&
        req.body.confirmPassword) {
    
          // confirm that user typed same password twice
          if (req.body.password !== req.body.confirmPassword) {
            var err = new Error('Passwords do not match.');
            err.status = 400;
            return next(err);
          }
    
          // create object with form input
          var userData = new User(
          { email: req.body.email,
            name: req.body.name,
            password: req.body.password
          });
    
          // use schema's `create` method to insert document into Mongo
          User.create(userData, function (error, user) {
            if (error) {
              return next(error);
            } else {
              req.session.userId = user._id;
              return res.redirect('/');
            }
          });
    
        } else {
          var eor = new Error('All fields required.');
          eor.status = 400;
          return next(eor);
    }

};
