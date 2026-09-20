const User = require('../models/User');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items
// @route   GET /api/admin/items
// @access  Private/Admin
exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find({}).populate('owner', 'name college');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active loans
// @route   GET /api/admin/loans
// @access  Private/Admin
exports.getActiveLoans = async (req, res) => {
  try {
    const loans = await BorrowRequest.find({ status: { $in: ['accepted', 'handed_over'] } })
      .populate('item', 'name')
      .populate('borrower', 'name')
      .populate('owner', 'name');
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
