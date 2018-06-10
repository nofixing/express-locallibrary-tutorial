var User = require('../models/user');

const {
  body,
  validationResult
} = require('express-validator/check');
const {
  sanitizeBody
} = require('express-validator/filter');

var async = require('async');

exports.logout = function (req, res, next) {

  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }

};

exports.login_post = function (req, res, next) {

  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        if (user.certyn == 'N') {
          var crr = new Error('Oops. you are not certified!');
          crr.status = 401;
          return next(crr);
        } else {
          req.session.userId = user._id;
          return res.redirect('/');
        }
      }
    });
  } else {
    var err = new Error('Email and password are required.');
    err.status = 401;
    return next(err);
  }

};

exports.emailcheck = function (req, res, next) {

  User.find({email: req.body.email})
    .exec(function (err, user) {
      if (err) { return next(err); }
      if (user.length > 0){
        console.log('email:'+user[0].email);
        req.body.emailThere = 'Y';
        res.send(req.body);
      } else {
        req.body.emailThere = 'N';
        res.send(req.body);
      }
    });

};

exports.registration_post = function (req, res, next) {

  console.log('registration_post call');
  
  var randomstring = require("randomstring");

  if (req.body.email &&
    req.body.name &&
    req.body.password &&
    req.body.confirmPassword) {
    console.log('name:'+req.body.name);
    // confirm that user typed same password twice
    if (req.body.password !== req.body.confirmPassword) {
      var err = new Error('Passwords do not match.');
      err.status = 400;
      return next(err);
    }

    // create object with form input
    var userData = new User({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      randomstring: randomstring.generate(),
      certyn: 'N'
    });

    // use schema's `create` method to insert document into Mongo
    User.create(userData, function (error, user) {
      if (error) {
        console.log(error);
        return next(error);
      } else {
        req.session.userId = user._id;
        /*
        var nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'nofixing@gmail.com',
            pass: 'asdfqwer!@#$'
          }
        });

        var emlCont = 'To complete the email verification process, click the following link.<br/>';
        emlCont += '<a href="'+req.headers.host+'/user/verifyemail?code='+user._id+'|'+user.randomstring+'">Click</a>';
        
        var mailOptions = {
          from: 'nofixing@gmail.com',
          to: req.body.email,
          subject: 'myStory Email Verification',
          text: emlCont
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        */
        return res.redirect('/');
      }
    });

  } else {
    var eor = new Error('All fields required.');
    eor.status = 400;
    return next(eor);
  }

};

exports.verifyemail = function (req, res, next) {

  var code = req.params.code;
  console.log('code:'+code);
  var id = code.substring(0, code.indexOf("|"));
  console.log('id:'+id);
  var randomstring = code.substring(code.indexOf("|")+1);
  console.log('randomstring:'+randomstring);
  
  User.find({_id: id, randomstring: randomstring})
    .exec(function (err, user) {
      if (err) { return next(err); }
      user.certyn = 'Y';
      User.findByIdAndUpdate(id, user, {}, function (err,theUser) {
        if (err) { return next(err); }
           // Successful - redirect to story detail page.
           req.session.userId = user._id;
           res.redirect('/catalog?cert=OK');
        });
    });

};
