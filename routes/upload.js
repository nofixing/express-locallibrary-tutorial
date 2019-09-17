var express = require('express');
var router = express.Router();
var Story = require('../models/story');
var File = require('../models/file');

const {Storage} = require('@google-cloud/storage');
const Multer = require('multer');
const {format} = require('util');
const projectId = 'infinitestorlet';

const storage = new Storage({
  projectId: projectId,
  credentials: {
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL
  }
});

// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // no larger than 10mb, you can change as needed.
  }
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
  console.log('req.file.originalname:'+req.file.originalname);
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', (err) => {
    console.log('file upload error:'+err);
    next(err);
  });

  blobStream.on('finish', () => {
    // The public URL can be used to directly access the file via HTTP.
    const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
    console.log(publicUrl);

    var arr = publicUrl.split("/");
    var lnum = publicUrl.split("/").length -1;
    var vsrc = arr[lnum];

    var file = new File(
      { user: req.session.userId,
      story: req.body.storyId,
      file_path: publicUrl,
      file_name: vsrc,
      file_size: req.file_upload.size,
      create_date: Date.now()
      });

      file.save(function (err, theFile) {
        if (err) { console.log(err); return next(err); }
          console.log('story file created');
          res.status(200).send(publicUrl+'&'+theFile._id);
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
  bucket.file(req.body.file_name).delete();
  
  File.findByIdAndRemove(req.body.file_id, function deleteFile(err) {
    if (err) { return next(err); }
    res.send(req.body);
  });
  
});

module.exports = router;
