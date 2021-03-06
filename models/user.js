var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  randomstring: {
    type: String,
    trim: true
  },
  certyn: {
    type: String,
    trim: true
  },
  clang: {
    type: String,
    trim: true
  },
  cfnt: {
    type: String,
    trim: true
  },
  cfwt: {
    type: String,
    trim: true
  },
  cfnt2: {
    type: String,
    trim: true
  },
  gid_token: {type: String}
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
  User.findOne({
      email: email
    })
    .exec(function (err, user) {
      if (err) {
        return callback(err);
      } else if (!user) {
        var error = new Error('User not found.');
        error.status = 401;
        return callback(error);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      });
    });
};

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});


var User = mongoose.model('User', UserSchema);
module.exports = User;