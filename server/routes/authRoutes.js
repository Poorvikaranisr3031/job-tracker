const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { signup, login, updateProfile, changePassword } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.put('/profile', authMiddleware, updateProfile);
router.put('/password', authMiddleware, changePassword);

module.exports = router;