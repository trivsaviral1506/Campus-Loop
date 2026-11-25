const express = require('express');
const router = express.Router();
const { 
  createRequest, 
  getBorrowerRequests, 
  getOwnerRequests, 
  updateRequestStatus,
  cancelRequest,
  verifyHandover
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createRequest);

router.get('/borrower', protect, getBorrowerRequests);
router.get('/owner', protect, getOwnerRequests);

router.delete('/:id', protect, cancelRequest);
router.put('/:id/status', protect, updateRequestStatus);
router.post('/:id/verify-handover', protect, verifyHandover);

module.exports = router;
