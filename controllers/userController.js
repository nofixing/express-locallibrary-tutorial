var User = require('../models/user');
var bcrypt = require('bcrypt');

const entities = require('entities');

const {
  body,
  validationResult
} = require('express-validator/check');
const {
  sanitizeBody
} = require('express-validator/filter');

var async = require('async');

const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = "829220596871-tkcc5nujoge6trq2ls28rsc0bge9cp5q.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

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

exports.login_post = async (req, res, next) => {

  if (req.body.gid_token == req.body.password) {
    const ticket = await client.verifyIdToken({
      idToken: req.body.gid_token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    const aud = payload['aud'];
    console.log('userid:'+userid);
    console.log('aud:'+aud);
    
    if (aud == CLIENT_ID) {
      User.find({gid_token: userid})
        .exec(function (err, user) {
          if (err) { return next(err); }
          if (user.length > 0){
            req.session.userId = user[0]._id;
            req.session.cfnt = user[0].cfnt;
            req.session.cfwt = user[0].cfwt;
            req.session.cfnt2 = user[0].cfnt2;
            req.session.clang = user[0].clang;
            req.session.userName = user[0].name;
            req.session.userEmail = user[0].email;
            console.log("user.name:"+user[0].name);
            console.log("user.cfnt:"+user[0].cfnt+"/:"+entities.decodeHTML(user[0].cfnt));
            console.log("user.cfnt2:"+user[0].cfnt2+"/:"+entities.decodeHTML(user[0].cfnt2));
            console.log("user.cfwt:"+user[0].cfwt+"/:"+user[0].cfwt);
            if (req.session.redirectUrl) {
              return res.redirect(req.session.redirectUrl);
            } else {
              return res.redirect('/catalog?clang='+user[0].clang+'&cfnt='+entities.decodeHTML(user[0].cfnt)+'&cfwt='+user[0].cfwt);
            }
          } else {
            var err2 = new Error('You have to sign up first.');
            err2.status = 401;
            res.render('login_form', { title: 'Log In', sign_token: 'unsign' });
          }
        });
    } else {
      var err = new Error('Google Sign In Error.');
      err.status = 400;
      return next(err);
    }
  } else {
    console.log("req.body.email:"+req.body.email);
    console.log("req.body.password:"+req.body.password);
    if (req.body.email && req.body.password) {
      User.authenticate(req.body.email, req.body.password, function (error, user) {
        if (error || !user) {
          var err = new Error('Wrong email or password.');
          err.status = 401;
          res.render('login_form', { title: 'Log In', errors: err });
        } else {
          if (user.certyn == 'N') {
            var crr = new Error('Oops. you are not certified!');
            crr.status = 401;
            res.render('login_form', { title: 'Log In', errors: crr });
          } else {
            req.session.userId = user._id;
            req.session.cfnt = user.cfnt;
            req.session.cfwt = user.cfwt;
            req.session.cfnt2 = user.cfnt2;
            req.session.clang = user.clang;
            req.session.userName = user.name;
            req.session.userEmail = user.email;
            console.log("user.name:"+user.name);
            console.log("user.cfnt:"+user.cfnt+"/:"+entities.decodeHTML(user.cfnt));
            console.log("user.cfnt2:"+user[0].cfnt2+"/:"+entities.decodeHTML(user[0].cfnt2));
            console.log("user.cfwt:"+user.cfwt+"/:"+user.cfwt);
            if (req.session.redirectUrl) {
              return res.redirect(req.session.redirectUrl);
            } else {
              return res.redirect('/catalog?clang='+user.clang+'&cfnt='+entities.decodeHTML(user.cfnt)+'&cfwt='+user.cfwt);
            }
          }
        }
      });
    } else {
      var err = new Error('Email and password are required.');
      err.status = 401;
      res.render('login_form', { title: 'Log In', errors: err });
    }

  }

};

exports.alter_password_get = function (req, res, next) {

  res.render('alter_password', { hostname: req.headers.host, cfnt: req.session.cfnt, cfnt2: req.session.cfnt2, cfwt: req.session.cfwt });

};

exports.alter_password_post = function (req, res, next) {
  
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function (error, user) {
      if (error || !user) {
        //var err = new Error('Wrong email or password.');
        //err.status = 401;
        console.log("Wrong email or password.");
        req.body.rcode = '401';
        res.send(req.body);
      } else {
        bcrypt.hash(req.body.new_password, 10, function (err, hash) {
          req.body.new_password = hash;
          console.log("hash:"+req.body.new_password);
          User.update({_id: user._id}, {
              password: req.body.new_password
          }, function(err, theUser) {
              if (err) { return next(err); }
              console.log("Success");
              req.body.rcode = '000';
              res.send(req.body);
          });
        });
      }
    });
  } else {
    //var err = new Error('Email and password are required.');
    //err.status = 401;
    console.log("Email and password are required.");
    req.body.rcode = '402';
    res.send(req.body);
  }

};

exports.alter_name_get = function (req, res, next) {

  User.findById(req.session.userId)
    .exec(function (err, user) {
      if (err) { return next(err); }
      res.render('alter_name', { hostname: req.headers.host, user: user });
    });

};

exports.alter_name_post = function (req, res, next) {
  
  if (req.body.new_name) {
    User.find({name: req.body.new_name})
      .exec(function (err, theUser) {
        if (err) { return next(err); }
        if (theUser.length > 0){
          req.body.rcode = '402';
          res.send(req.body);
        } else {
          User.update({_id: req.session.userId}, {
                name: req.body.new_name
            }, function(err, theUser) {
                if (err) { return next(err); }
                console.log("Success");
                req.body.rcode = '000';
                res.send(req.body);
            });
        }
      });
  } else {
    console.log("New Name is required.");
    req.body.rcode = '403';
    res.send(req.body);
  }

};

exports.alter_font_get = function (req, res, next) {

  User.findById(req.session.userId)
    .exec(function (err, user) {
      if (err) { return next(err); }
      res.render('alter_font', { hostname: req.headers.host, user: user });
    });

};

exports.alter_font_post = function (req, res, next) {
  
  User.update({_id: req.session.userId}, {
    cfnt: req.body.cfnt,
    cfnt2: req.body.cfnt2
  }, function(err, theUser) {
      if (err) { return next(err); }
      console.log("Success");
      req.body.rcode = '000';
      res.send(req.body);
  });

};

exports.login_app = function (req, res, next) {

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
          res.json({ session: req.sessionID });
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
        /*
        User.find({name: req.body.name})
          .exec(function (err, theUser) {
            if (err) { return next(err); }
            if (theUser.length > 0){
              console.log('theUser:'+theUser);
              console.log('name:'+theUser[0].name);
              req.body.nameThere = 'Y';
              res.send(req.body);
            } else {
              req.body.nameThere = 'N';
              res.send(req.body);
            }
          });
        */
       req.body.nameThere = 'N';
       res.send(req.body);
      }
    });

};

exports.registration_post = function (req, res, next) {

  console.log('registration_post call');

  var eor = new Error('You cannot sign up for membership at this time.');
  eor.status = 400;
  return next(eor);
  /*
  var randomstring = require("randomstring");

  if (req.body.name &&
    req.body.email &&
    req.body.password &&
    req.body.confirmPassword) {
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
        //req.session.userId = user._id;
        
        var nodemailer = require('nodemailer');

        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'nofixing@gmail.com',
            pass: 'nlrgkuedjqopymvi'
          }
        });

        var emlCont = 'To complete the email verification process, click the following link.  ';
        emlCont += 'https://'+req.headers.host+'/user/verifyemail?code='+user._id+'|'+user.randomstring;
        
        var mailOptions = {
          from: 'nofixing@gmail.com',
          to: req.body.email,
          subject: 'infinitestorlet Email Verification',
          text: emlCont
        };

        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        
        return res.redirect('/');
      }
    });

  } else {
    var eor = new Error('All fields required.');
    eor.status = 400;
    return next(eor);
  }
  */
};

exports.gidcheck = async (req, res, next) => {
  const ticket = await client.verifyIdToken({
    idToken: req.body.gid_token,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  const aud = payload['aud'];
  console.log('userid:'+userid);
  console.log('aud:'+aud);
  if (aud != CLIENT_ID) {
    var err = new Error('Google Sign In Error.');
    err.status = 400;
    return next(err);
  }
  User.find({gid_token: userid})
    .exec(function (err, user) {
      if (err) { return next(err); }
      if (user.length > 0){
        console.log('gid_token:'+user[0].gid_token);
        req.body.gidThere = 'Y';
        res.send(req.body);
      } else {
        req.body.gidThere = 'N';
        /*
        User.find({name: req.body.name})
          .exec(function (err, theUser) {
            if (err) { return next(err); }
            if (theUser.length > 0){
              console.log('theUser:'+theUser);
              console.log('name:'+theUser[0].name);
              req.body.nameThere = 'Y';
              res.send(req.body);
            } else {
              req.body.nameThere = 'N';
              res.send(req.body);
            }
          });
        */
       req.body.nameThere = 'N';
       res.send(req.body);
      }
    });

};

exports.rgst_post = async (req, res, next) => {

  console.log('rgst_post call');

  var randomstring = require("randomstring");

  if (req.body.name &&
    req.body.email &&
    req.body.password &&
    req.body.confirmPassword) {
      // confirm that user typed same password twice
      if (req.body.password !== req.body.confirmPassword) {
        var err = new Error('Passwords do not match.');
        err.status = 400;
        return next(err);
      }

    var certyn = 'N';
    var gid_token = '';

    if (req.body.gid_token == req.body.password) {
      const ticket = await client.verifyIdToken({
        idToken: req.body.gid_token,
        audience: CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const userid = payload['sub'];
      const aud = payload['aud'];
      console.log('userid:'+userid);
      console.log('aud:'+aud);
      
      if (aud == CLIENT_ID) {
        certyn = 'Y';
        gid_token = userid;
      } else {
        var err = new Error('Google Sign In Error.');
        err.status = 400;
        return next(err);
      }
    }

    // create object with form input
    var userData = new User({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
      randomstring: randomstring.generate(),
      certyn: certyn,
      gid_token: gid_token
    });

    // use schema's `create` method to insert document into Mongo
    User.create(userData, function (error, user) {
      if (error) {
        console.log(error);
        return next(error);
      } else {
        //req.session.userId = user._id;
        
        if (certyn == 'N') {
          var nodemailer = require('nodemailer');

          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'nofixing@gmail.com',
              pass: 'nlrgkuedjqopymvi'
            }
          });
  
          var emlCont = 'To complete the email verification process, click the following link.  ';
          emlCont += 'https://'+req.headers.host+'/user/verifyemail?code='+user._id+'|'+user.randomstring;
          
          var mailOptions = {
            from: 'nofixing@gmail.com',
            to: req.body.email,
            subject: 'infinitestorlet Email Verification',
            text: emlCont
          };
  
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
          
          return res.redirect('/');
        } else {
          req.session.userId = user._id;
          req.session.cfnt = user.cfnt;
          req.session.cfwt = user.cfwt;
          req.session.cfnt2 = user.cfnt2;
          req.session.clang = user.clang;
          req.session.userName = user.name;
          req.session.userEmail = user.email;
          console.log("user.name:"+user.name);
          console.log("user.cfnt:"+user.cfnt+"/:"+entities.decodeHTML(user.cfnt));
          return res.redirect('/catalog?clang='+user.clang+'&cfnt='+entities.decodeHTML(user.cfnt)+'&cfwt='+user.cfwt);
        }

      }
    });

  } else {
    var eor = new Error('All fields required.');
    eor.status = 400;
    return next(eor);
  }
  
};

exports.forgot_password = function (req, res, next) {

  console.log('forgot_password call');
  
  var randomstring = require("randomstring");
  var new_password = randomstring.generate({
    length: 4,
    charset: 'numeric'
  });

  User.find({email: req.body.email})
    .exec(function (err, user) {
      if (err) { return next(err); }
      if (user.length > 0){
        console.log('email:'+user[0].email);
        var id = user[0]._id;
        bcrypt.hash(new_password, 10, function (err, hash) {
          console.log("new_password:"+new_password+"/hash:"+hash);
          var newvalues = { $set: {password: hash} };
          User.findByIdAndUpdate(id, newvalues, {}, function(err, theUser) {
              if (err) { return next(err); }
              console.log("theUser:"+theUser);
              var nodemailer = require('nodemailer');

              var transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: 'nofixing@gmail.com',
                  pass: 'nlrgkuedjqopymvi'
                }
              });

              var emlCont = 'Your  temporary password is '+new_password+' You should change your password';
              
              var mailOptions = {
                from: 'nofixing@gmail.com',
                to: req.body.email,
                subject: 'infinitestorlet notice',
                text: emlCont
              };

              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              
              console.log("Success");
              req.body.rcode = '000';
              res.send(req.body);
          });
        });
      } else {
        req.body.rcode = '400';
        res.send(req.body);
      }
    });

};

exports.verifyemail = function (req, res, next) {

  var code = req.query.code;
  console.log('code:'+code);
  var id = code.substring(0, code.indexOf("|"));
  console.log('id:'+id);
  var randomstring = code.substring(code.indexOf("|")+1);
  console.log('randomstring:'+randomstring);
  
  User.find({_id: id, randomstring: randomstring})
    .exec(function (err, user) {
      if (err) { return next(err); }
      var newvalues = { $set: {certyn: "Y"} };
      User.findByIdAndUpdate(id, newvalues, {}, function (err,theUser) {
        if (err) { return next(err); }
           // Successful - redirect to story detail page.
           req.session.userId = user._id;
           res.redirect('/catalog?cert=OK');
        });
    });

};
