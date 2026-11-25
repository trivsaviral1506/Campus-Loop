const express = require('express');
const router = express.Router();
const { getRequestMessages, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/request/:requestId', protect, getRequestMessages);
router.post('/request/:requestId', protect, sendMessage);

module.exports = router;

