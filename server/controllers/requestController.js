const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');

// @desc    Create borrow request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const { itemId, startDate, endDate } = req.body;
    
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (!item.isAvailable) {
      return res.status(400).json({ message: 'Item is not available' });
    }

    const request = await BorrowRequest.create({
      borrower: req.user.id,
      owner: item.owner,
      item: item._id,
      startDate,
      endDate
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get requests made by the current user (Borrower dashboard)
// @route   GET /api/requests/borrower
// @access  Private
exports.getBorrowerRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ borrower: req.user.id })
      .populate('item')
      .populate('owner', 'name');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get requests received by the current user (Owner dashboard)
// @route   GET /api/requests/owner
// @access  Private
exports.getOwnerRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ owner: req.user.id })
      .populate('item')
      .populate('borrower', 'name college');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status (Owner or Borrower based on status flow)
// @route   PUT /api/requests/:id/status
// @access  Private
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Owner actions: accept, reject, mark returned
    // Borrower actions: mark handed_over (or Owner can do it, keeping it simple: owner manages it)
    if (request.owner.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    request.status = status;
    const updatedRequest = await request.save();

    // If accepted or handed_over, maybe make item unavailable? 
    // Usually if handed_over, item is definitely not available.
    if (status === 'accepted' || status === 'handed_over') {
      await Item.findByIdAndUpdate(request.item, { isAvailable: false });
    } else if (status === 'returned' || status === 'rejected') {
      await Item.findByIdAndUpdate(request.item, { isAvailable: true });
    }

    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
