const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage for photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const mimeMatch = allowed.test(file.mimetype);
  const extMatch = allowed.test(path.extname(file.originalname).toLowerCase());
  if (mimeMatch && extMatch) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpeg, jpg, png, webp) are permitted.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter
});

// Photo upload endpoint (Authenticated users)
router.post('/photo', auth, upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo file provided.' });
    }

    const relativeUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({
      success: true,
      message: 'Photo uploaded successfully.',
      data: {
        filename: req.file.filename,
        url: relativeUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
