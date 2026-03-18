const express = require("express");
const multer = require("multer");
const crypto = require("crypto");
const { verifyAdmin } = require("../middleware/adminAuth");
const config = require("../config/config");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }
});

const ensureCloudinaryConfigured = () => {
  const { CLOUDINARY } = config;
  return Boolean(
    CLOUDINARY.CLOUD_NAME &&
    CLOUDINARY.API_KEY &&
    CLOUDINARY.API_SECRET
  );
};

const createSignature = (params) => {
  const sorted = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${sorted}${config.CLOUDINARY.API_SECRET}`)
    .digest("hex");
};

router.post(
  "/image",
  verifyAdmin,
  (req, res, next) => {
    if (!ensureCloudinaryConfigured()) {
      return res.status(500).json({ msg: "Cloudinary is not configured" });
    }

    upload.single("image")(req, res, (err) => {
      if (err) {
        const status = err instanceof multer.MulterError ? 400 : 500;
        return res.status(status).json({ msg: err.message });
      }
      return next();
    });
  },
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ msg: "Please attach an image file" });
    }

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const folder = config.CLOUDINARY.UPLOAD_FOLDER || "";
      const params = { timestamp };
      if (folder) params.folder = folder;
      const signature = createSignature(params);

      const base64 = req.file.buffer.toString("base64");
      const payload = new URLSearchParams();
      payload.append("file", `data:${req.file.mimetype};base64,${base64}`);
      payload.append("api_key", config.CLOUDINARY.API_KEY);
      payload.append("timestamp", timestamp);
      payload.append("signature", signature);
      if (folder) payload.append("folder", folder);

      const endpoint = `https://api.cloudinary.com/v1_1/${config.CLOUDINARY.CLOUD_NAME}/image/upload`;
      const response = await fetch(endpoint, {
        method: "POST",
        body: payload
      });
      const data = await response.json();

      if (!response.ok) {
        return res
          .status(response.status)
          .json({ msg: data.error?.message || "Unable to upload image" });
      }

      return res.json({
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height
      });
    } catch (error) {
      console.error("Cloudinary upload failed", error);
      return res.status(500).json({ msg: "Unable to upload image" });
    }
  }
);

module.exports = router;
