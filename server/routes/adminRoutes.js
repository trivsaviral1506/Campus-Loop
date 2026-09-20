const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getAllItems, 
  getActiveLoans,
  getAdminMetrics 
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/metrics', protect, admin, getAdminMetrics);
router.get('/users', protect, admin, getUsers);
router.get('/items', protect, admin, getAllItems);
router.get('/loans', protect, admin, getActiveLoans);

module.exports = router;
