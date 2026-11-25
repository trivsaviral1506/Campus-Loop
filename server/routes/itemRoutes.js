const express = require('express');
const router = express.Router();
const { 
  createItem, 
  getItems, 
  getItemById, 
  updateItem, 
  deleteItem, 
  getMyItems, 
  getPickupZones 
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(protect, createItem)
  .get(getItems);

router.get('/pickup-zones', getPickupZones);
router.get('/my', protect, getMyItems);

router.route('/:id')
  .get(getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

module.exports = router;
