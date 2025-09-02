const express = require('express');
const AWS = require('aws-sdk');
const router = express.Router();

// Reuse default AWS SDK credentials/config (env-based)
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Very small allowlist: only allow keys under the recipes/ prefix
const isAllowedKey = (key) => {
  if (typeof key !== 'string') return false;
  if (!key.startsWith('recipes/')) return false;
  if (key.includes('..')) return false; // prevent traversal
  return true;
};

// GET /api/images?key=recipes/<uuid>.jpg
router.get('/', async (req, res) => {
  try {
    const { key } = req.query;
    if (!key || !isAllowedKey(key)) {
      return res.status(400).json({ msg: 'Invalid or disallowed key' });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    // Stream the object to the client
    const s3Stream = s3.getObject(params).createReadStream();

    // Fetch head to set headers (content-type, length, caching)
    s3.headObject(params, (err, data) => {
      if (!err && data) {
        if (data.ContentType) res.setHeader('Content-Type', data.ContentType);
        if (data.ContentLength) res.setHeader('Content-Length', data.ContentLength);
        // Cache for 1 day by default
        res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
      }
      // Pipe after headers set
      s3Stream.on('error', (e) => {
        if (e.code === 'NoSuchKey') return res.status(404).end();
        return res.status(502).end();
      });
      s3Stream.pipe(res);
    });
  } catch (e) {
    return res.status(500).json({ msg: 'Image proxy error' });
  }
});

module.exports = router;

