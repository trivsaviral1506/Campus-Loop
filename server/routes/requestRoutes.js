const express = require('express');
const router = express.Router();
const { createRequest, getBorrowerRequests, getOwnerRequests, updateRequestStatus } = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createRequest);

router.get('/borrower', protect, getBorrowerRequests);
router.get('/owner', protect, getOwnerRequests);

router.put('/:id/status', protect, updateRequestStatus);

module.exports = router;
