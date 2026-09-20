const express = require('express');
const router = express.Router();
const { getUsers, getAllItems, getActiveLoans } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.get('/users', protect, admin, getUsers);
router.get('/items', protect, admin, getAllItems);
router.get('/loans', protect, admin, getActiveLoans);

module.exports = router;
