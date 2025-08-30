const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload single image
router.post('/single', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Upload multiple images
router.post('/multiple', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'No files uploaded' } });
    }

    const images = req.files.map((file, index) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      alt: req.body[`alt_${index}`] || `Image ${index + 1}`,
      isPrimary: index === 0,
      order: index
    }));

    res.json({
      success: true,
      data: { images }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Delete image
router.delete('/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'File deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: { message: 'File not found' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});

module.exports = router;