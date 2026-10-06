const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'job-tracker-resumes',
    resource_type: 'raw', // allows PDFs/docs, not just images
    allowed_formats: ['pdf', 'doc', 'docx'],
  },
});

const upload = multer({ storage });

module.exports = upload;