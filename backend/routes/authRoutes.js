const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserName,
    updateUserEmail,
    updateUserPassword
} = require('../controllers/userController');

// Public routes
router.post('/signup', registerUser);
router.post('/login', loginUser);

// Protected routes
router.get('/profile', protect, getUserProfile);
router.put('/update-name', protect, updateUserName);
router.put('/update-email', protect, updateUserEmail);
router.put('/update-password', protect, updateUserPassword);

module.exports = router;
