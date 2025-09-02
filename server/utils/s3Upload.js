/**
 * Utility for uploading images to AWS S3.
 * @module utils/s3Upload
 */
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});


/**
 * Uploads an image file to AWS S3 and returns the public URL.
 * @async
 * @function uploadImageToS3
 * @param {Object} file - The file object to upload.
 * @param {string} file.originalname - The original name of the file (used to determine extension).
 * @param {Buffer} file.buffer - The file data as a buffer.
 * @param {string} file.mimetype - The MIME type of the file.
 * @returns {Promise<string>} The public URL of the uploaded image.
 */
const uploadImageToS3 = async (file) => {
    const fileExtension = file.originalname.split('.').pop();
    const key = `recipes/${uuidv4()}.${fileExtension}`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        // Ensure the uploaded object is readable publicly when serving directly from S3
        ACL: 'public-read',
    };

    await s3.upload(params).promise();
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

module.exports = { uploadImageToS3 };
