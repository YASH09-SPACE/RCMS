const multer = require('multer');
const path = require('path');
const fs = require('fs');

let storage;

// Try Cloudinary if configured
try {
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'RCMS') {
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    const cloudinary = require('../config/cloudinary');
    storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'rcms',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }]
      }
    });
    console.log('📸 Upload: Using Cloudinary storage');
  } else {
    throw new Error('Cloudinary not configured, using local storage');
  }
} catch (err) {
  // Fallback to local disk storage
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
      const ext = path.extname(file.originalname);
      cb(null, `complaint-${unique}${ext}`);
    }
  });
  console.log('📸 Upload: Using local disk storage (uploads/)');
}

// File filter - only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Increased to 10MB max per file
    files: 5 // Maximum 5 files
  }
});

module.exports = upload;
