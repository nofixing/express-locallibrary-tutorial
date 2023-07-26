var express = require('express');
var router = express.Router();
var Story = require('../models/story');
var Genre = require('../models/genre');
var Word = require('../models/word');
var Memo = require('../models/memo');
var Book = require('../models/book');
var Comment = require('../models/comment');
var History = require('../models/history');
var BookMark = require('../models/bookMark');
var File = require('../models/file');
var User = require('../models/user');
var bcrypt = require('bcrypt');

const { Storage } = require('@google-cloud/storage');
const Multer = require('multer');
const { format } = require('util');
const projectId = 'infinitestorlet';

// const storage = new Storage({
//   projectId: projectId,
//   credentials: {
//     private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//     client_email: process.env.GOOGLE_CLIENT_EMAIL
//   }
// });
const storage = new Storage({ keyFilename: 'google-credentials.json' });

// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // no larger than 10mb, you can change as needed.
  },
});

const bucket = storage.bucket(projectId);

router.post('/', multer.single('file_upload'), (req, res, next) => {
  console.log('upload started');
  if (!req.file) {
    console.log('No file uploaded.');
    res.status(400).send('No file uploaded.');
    return;
  }

  // Create a new blob in the bucket and upload the file data.
  console.log('req.file.originalname:' + req.file.originalname);
  const gcsFileName = `${req.session.userId}/${Date.now()}-${
    req.file.originalname
  }`;
  const blob = bucket.file(gcsFileName);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    console.log('file upload error:' + err);
    next(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(
      `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    );
    console.log(publicUrl);

    var arr = publicUrl.split('/');
    var lnum = publicUrl.split('/').length - 1;
    var vsrc = arr[lnum];

    var file = new File({
      user: req.session.userId,
      story: req.body.storyId,
      file_path: publicUrl,
      file_name: vsrc,
      file_size: req.file.size,
      create_date: Date.now(),
    });

    file.save(function (err, theFile) {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log('story file created');
      res
        .status(200)
        .send(publicUrl + '&' + theFile._id + '&' + vsrc.substring(14));
    });
    /*
    Story.update({_id: req.body.storyId}, {
        file_path: publicUrl
    }, function(err, theStory) {
        if (err) { return next(err); }
        console.log('story file path updated');
        res.status(200).send(publicUrl);
    });
    */
  });

  blobStream.end(req.file.buffer);
});

router.post('/delete', (req, res, next) => {
  console.log('delete started');

  // Deletes the file from the bucket
  bucket.file(req.session.userId + '/' + req.body.file_name).delete();

  File.findByIdAndRemove(req.body.file_id, function deleteFile(err) {
    if (err) {
      return next(err);
    }
    res.send(req.body);
  });
});

router.post('/deleteFiles', (req, res, next) => {
  console.log('deleteFiles started');

  if (req.session) {
    console.log('req session started');

    if (req.body.email && req.body.password) {
      console.log('req.body.email && req.body.password');
      User.authenticate(
        req.body.email,
        req.body.password,
        function (error, user) {
          console.log('User.authenticate started');
          if (error || !user) {
            console.log('deleteFiles authenticate error ' + error);
            req.body.success = 'N';
            res.send(req.body);
          } else {
            console.log('bucket deleteFiles started');
            bucket.deleteFiles(
              {
                prefix: `${req.session.userId}/`,
                force: true,
              },
              function (err) {
                if (err) {
                  console.log('files delete error ' + err);
                  return next(err);
                }
                console.log('data delete started');
                Book.find({ user: req.session.userId })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('Book deleted:' + JSON.stringify(data));
                  });
                BookMark.find({ user: req.session.userId })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('BookMark deleted:' + JSON.stringify(data));
                  });
                Comment.find({ user: req.session.userId })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('Comment deleted:' + JSON.stringify(data));
                  });
                File.find({ user: req.session.userId })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('File deleted:' + JSON.stringify(data));
                  });
                Genre.find({ user: req.session.userId })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('Genre deleted:' + JSON.stringify(data));
                  });
                History.find({ user: req.session.userId })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('History deleted:' + JSON.stringify(data));
                  });
                Memo.find({ user: req.session.userId })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('Memo deleted:' + JSON.stringify(data));
                  });
                Story.find({ user: req.session.userId })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('Story deleted:' + JSON.stringify(data));
                  });
                User.find({ email: req.session.userEmail })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('User deleted:' + JSON.stringify(data));
                  });
                Word.find({ user: req.session.userId })
                  .remove()
                  .exec(function (err, data) {
                    if (!err)
                      console.log('Word deleted:' + JSON.stringify(data));
                  });

                req.session.destroy(function (err) {
                  if (err) {
                    console.log('session destroy error ' + err);
                    return next(err);
                  } else {
                    req.body.success = 'Y';
                    res.send(req.body);
                  }
                });
              }
            );
          }
        }
      );
    }
  }
});

module.exports = router;
