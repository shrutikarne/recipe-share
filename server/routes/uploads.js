const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadImageToS3 } = require('../utils/s3Upload');
const { verifyToken } = require('../middleware/auth');

// Use memory storage for S3 uploads, disk storage for local
const useS3 = process.env.USE_S3_UPLOAD === 'true';
const storage = useS3
  ? multer.memoryStorage()
  : multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/recipes');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer with storage, limits, and file filter
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB size limit
  },
  fileFilter: fileFilter
});

/**
 * @route   POST /api/uploads/recipe-image
 * @desc    Upload a recipe image
 * @access  Private
 */
router.post('/recipe-image', verifyToken, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        console.error('Multer error during image upload:', err);
        return res.status(400).json({
          msg: 'Upload failed',
          details: err.message
        });
      }

      console.error('Unexpected error during image upload:', err);
      return res.status(500).json({
        msg: 'Unexpected error during upload',
        details: err.message
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ msg: 'No file uploaded' });
      }

      let imageUrl;
      let imageKey;
      if (useS3) {
        const result = await uploadImageToS3(req.file);
        imageUrl = result?.url;
        imageKey = result?.key;
      } else {
        imageUrl = `/uploads/recipes/${req.file.filename}`;
        imageKey = `recipes/${req.file.filename}`;
      }

      res.json({
        success: true,
        imageUrl,
        imageKey
      });
    } catch (error) {
      console.error('Error uploading recipe image:', error);
      res.status(500).json({
        msg: 'Server error during upload',
        details: error.message
      });
    }
  });
});

module.exports = router;
