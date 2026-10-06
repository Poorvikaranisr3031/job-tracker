const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createApplication,
  getApplications,
  updateApplication,
  deleteApplication,
  uploadResume,
  addPrepNote,
  deletePrepNote,
} = require('../controllers/applicationController');

router.use(authMiddleware);

router.post('/', createApplication);
router.get('/', getApplications);
router.put('/:id', updateApplication);
router.delete('/:id', deleteApplication);

router.post('/:id/resume', (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('MULTER/CLOUDINARY ERROR:', err);
      return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
    next();
  });
}, uploadResume);

router.post('/:id/prep', addPrepNote);
router.delete('/:id/prep/:noteId', deletePrepNote);

module.exports = router;