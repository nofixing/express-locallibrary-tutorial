var express = require('express');
//const uuid = require('uuid/v4');
const { v4: uuid } = require('uuid');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var catalog = require('./routes/catalog'); // Import routes for "catalog" area of site
var upload = require('./routes/upload');
var compression = require('compression');
var helmet = require('helmet');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var i18n=require("i18n-express");

// Create the Express application object
var app = express();
var device = require('express-device');
app.use(device.capture());

app.use(helmet());

app.use(function(req, res, next) {
  res.setHeader("content-security-policy-report-only", "base-uri 'self'; connect-src 'self'; default-src 'self'; font-src 'self' https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com; frame-src 'self' https://accounts.google.com; img-src 'self'; manifest-src 'self'; media-src 'self'; object-src 'none'; report-uri https://601cfe0c74246c4998ba0ebe.endpoint.csper.io/; script-src 'report-sample' 'self' https://apis.google.com/_/scs/apps-static/_/js/k=oz.gapi.en.86MLdKEg0Ug.O/m=auth2/exm=signin2/rt=j/sv=1/d=1/ed=1/am=wQE/rs=AGLTcCNVMDBrJcVLxr_OXSrhwhVXLtLCsQ/cb=gapi.loaded_1 https://cdn.jsdelivr.net/jquery.tooltipster/4.0.5/js/tooltipster.bundle.min.js https://cdn.quilljs.com/1.3.6/quill.js https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js https://code.jquery.com/jquery-3.4.1.min.js https://kit.fontawesome.com/e5e4a7b53c.js https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js; style-src 'report-sample' 'self' https://cdn.jsdelivr.net https://cdn.quilljs.com https://cdnjs.cloudflare.com https://maxcdn.bootstrapcdn.com https://stackpath.bootstrapcdn.com; worker-src 'none';");
  next();
});


// Set up mongoose connection
var mongoose = require('mongoose');
//var db_url = 'mongodb://infinite:'+process.env.DB_URI+'@ds153081-a0.mlab.com:53081,ds153081-a1.mlab.com:53081/infinitestorlet?replicaSet=rs-ds153081';
var db_url = 'mongodb+srv://infinite:'+process.env.DB_URI+'@cluster0-kgygz.mongodb.net/infinitestorlet?retryWrites=true&w=majority';
var mongoDB = process.env.MONGODB_URI || db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// use sessions for tracking logins
app.use(session({
  genid: (req) => {
    console.log('Inside the session middleware');
    console.log(req.sessionID);
    return uuid(); // use UUIDs for session IDs
  },
  secret: 'I love you',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Root directory
app.set('rootDir', path.resolve(__dirname));

// Uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());

app.use(compression()); // Compress all routes

app.use(express.static(path.join(__dirname, 'public')));

app.use(i18n({
  translationsPath: path.join(__dirname, 'i18n'), // <--- use here. Specify translations files path.
  siteLangs: ["ko","en"],
  defaultLocale: 'ko',
  textsVarName: 'translation'
}));

app.use('/', index);
app.use('/user', users);
app.use('/catalog', catalog); // Add catalog routes to middleware chain.
app.use('/upload', upload);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('404 error exists!!!!!');
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  // Render the error page
  res.status(err.status || 500);
  if (req.xhr) {
      res.send(err.message);
  } else {
      res.render('error');
  }
});

module.exports = app;
