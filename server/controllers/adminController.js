const User = require('../models/User');
const Item = require('../models/Item');
const BorrowRequest = require('../models/BorrowRequest');

// @desc    Get administrative dashboard metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
exports.getAdminMetrics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalItems = await Item.countDocuments({});
    const availableItems = await Item.countDocuments({ isAvailable: true });
    const pendingRequests = await BorrowRequest.countDocuments({ status: 'pending' });
    const activeLoans = await BorrowRequest.countDocuments({ status: { $in: ['accepted', 'handed_over'] } });
    const completedLoans = await BorrowRequest.countDocuments({ status: 'returned' });
    const overdueLoans = await BorrowRequest.countDocuments({
      status: { $in: ['accepted', 'handed_over'] },
      endDate: { $lt: new Date() }
    });

    res.json({
      totalUsers,
      totalItems,
      availableItems,
      unavailableItems: totalItems - availableItems,
      pendingRequests,
      activeLoans,
      completedLoans,
      overdueLoans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
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
    const items = await Item.find({}).populate('owner', 'name college department email').sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active and overdue loans
// @route   GET /api/admin/loans
// @access  Private/Admin
exports.getActiveLoans = async (req, res) => {
  try {
    const loans = await BorrowRequest.find({ status: { $in: ['accepted', 'handed_over', 'returned'] } })
      .populate('item', 'name category deposit')
      .populate('borrower', 'name email college')
      .populate('owner', 'name email college')
      .sort({ createdAt: -1 });
      
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
