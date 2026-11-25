const express = require('express');
const router = express.Router();
const { 
  createReview, 
  getUserReviews, 
  getRequestReviews 
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/user/:userId', getUserReviews);
router.get('/request/:requestId', protect, getRequestReviews);

module.exports = router;

