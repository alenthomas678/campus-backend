const aws = require('aws-sdk');
const multer = require('multer');
const s3Storage = require('multer-sharp-s3');

require('dotenv').config();

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    region: process.env.AWS_REGION
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error('Invalid Mime type, only JPEG and PNG are supported!'), false);
    }
}

const storage = s3Storage({
    s3,
    Bucket: process.env.AWS_BUCKET_NAME,
    ACL: 'public-read',
    resize: {
        width: 200,
        height: 160
    },
    normalize: true,
    trim: true,
    max: true
});

const upload = multer({
    fileFilter,
    storage: storage
});

module.exports = upload;
