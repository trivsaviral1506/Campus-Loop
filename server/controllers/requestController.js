const crypto = require('crypto');
const BorrowRequest = require('../models/BorrowRequest');
const Item = require('../models/Item');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create borrow request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const { itemId, startDate, endDate } = req.body;
    
    if (!itemId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide item, start date, and end date' });
    }

    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Prevent borrowing own item
    if (item.owner.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot borrow your own item' });
    }

    // Parse and validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (start >= end) {
      return res.status(400).json({ message: 'Start date must be strictly before end date' });
    }

    const maxDurationDays = 120;
    const durationDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (durationDays > maxDurationDays) {
      return res.status(400).json({ message: `Borrow duration cannot exceed ${maxDurationDays} days` });
    }

    // Check item general availability flag
    if (!item.isAvailable) {
      return res.status(400).json({ message: 'This item is currently unavailable' });
    }

    // Check for overlapping accepted or handed_over reservations
    const conflictingRequest = await BorrowRequest.findOne({
      item: item._id,
      status: { $in: ['accepted', 'handed_over'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (conflictingRequest) {
      return res.status(400).json({ message: 'Item already has an active or accepted reservation during the selected dates' });
    }

    // Prevent duplicate pending request by the same user on the same item
    const duplicatePending = await BorrowRequest.findOne({
      borrower: req.user.id,
      item: item._id,
      status: 'pending'
    });

    if (duplicatePending) {
      return res.status(400).json({ message: 'You already have a pending borrow request for this item' });
    }

    const request = await BorrowRequest.create({
      borrower: req.user.id,
      owner: item.owner,
      item: item._id,
      startDate: start,
      endDate: end,
      status: 'pending'
    });

    // Notify item owner
    await createNotification({
      user: item.owner,
      sender: req.user.id,
      type: 'request_created',
      title: 'New Borrow Request',
      message: `A student requested to borrow your item: "${item.name}"`,
      link: '/lent'
    });

    const populatedRequest = await BorrowRequest.findById(request._id)
      .populate('item')
      .populate('owner', 'name email college');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get requests made by current user (Borrower dashboard)
// @route   GET /api/requests/borrower
// @access  Private
exports.getBorrowerRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ borrower: req.user.id })
      .populate('item')
      .populate('owner', 'name college department email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get requests received by current user (Owner dashboard)
// @route   GET /api/requests/owner
// @access  Private
exports.getOwnerRequests = async (req, res) => {
  try {
    const requests = await BorrowRequest.find({ owner: req.user.id })
      .populate('item')
      .populate('borrower', 'name college department year email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a borrow request (Borrower only, pending requests)
// @route   DELETE /api/requests/:id
// @access  Private
exports.cancelRequest = async (req, res) => {
  try {
    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.borrower.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You can only cancel your own requests' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        message: `Cannot cancel a request with status "${request.status}". Only pending requests can be cancelled.` 
      });
    }

    request.status = 'cancelled';
    const updatedRequest = await request.save();

    // Notify owner
    await createNotification({
      user: request.owner,
      sender: req.user.id,
      type: 'request_cancelled',
      title: 'Request Cancelled',
      message: 'A pending borrow request was cancelled by the borrower.',
      link: '/lent'
    });

    res.json({ message: 'Borrow request cancelled successfully', request: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status (Owner actions: accept, reject, mark returned)
// @route   PUT /api/requests/:id/status
// @access  Private
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Only owner (or admin) can change status
    if (request.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Not authorized to update this request' });
    }

    // State transition validations
    if (request.status === 'pending') {
      if (status === 'accepted') {
        // Generate secure handover verification token and 6-digit PIN
        const token = crypto.randomBytes(16).toString('hex');
        const pin = Math.floor(100000 + Math.random() * 900000).toString();

        request.status = 'accepted';
        request.handoverToken = token;
        request.handoverPin = pin;

        await request.save();
        await Item.findByIdAndUpdate(request.item, { isAvailable: false });

        // Notify borrower
        await createNotification({
          user: request.borrower,
          sender: req.user.id,
          type: 'request_accepted',
          title: 'Request Accepted! 🎉',
          message: 'Your borrow request has been accepted. View your handover QR code and PIN in your dashboard.',
          link: '/borrowed'
        });

        return res.json(request);
      } else if (status === 'rejected') {
        request.status = 'rejected';
        await request.save();

        await createNotification({
          user: request.borrower,
          sender: req.user.id,
          type: 'request_rejected',
          title: 'Request Declined',
          message: 'Your borrow request was not accepted by the owner.',
          link: '/borrowed'
        });

        return res.json(request);
      } else {
        return res.status(400).json({ message: `Cannot transition from pending to ${status}` });
      }
    }

    if (request.status === 'accepted') {
      if (status === 'rejected' || status === 'cancelled') {
        request.status = status;
        await request.save();
        await Item.findByIdAndUpdate(request.item, { isAvailable: true });
        return res.json(request);
      } else if (status === 'handed_over') {
        // Manual override or verified handover
        request.status = 'handed_over';
        request.handoverVerifiedAt = new Date();
        await request.save();
        await Item.findByIdAndUpdate(request.item, { isAvailable: false });

        await createNotification({
          user: request.borrower,
          sender: req.user.id,
          type: 'handover_completed',
          title: 'Item Handed Over',
          message: 'The item handover was marked as completed.',
          link: '/borrowed'
        });

        return res.json(request);
      } else {
        return res.status(400).json({ message: `Cannot transition from accepted to ${status}` });
      }
    }

    if (request.status === 'handed_over') {
      if (status === 'returned') {
        request.status = 'returned';
        request.returnedAt = new Date();
        await request.save();
        await Item.findByIdAndUpdate(request.item, { isAvailable: true });

        // Notify borrower that return is confirmed
        await createNotification({
          user: request.borrower,
          sender: req.user.id,
          type: 'return_completed',
          title: 'Return Confirmed! ✅',
          message: 'The item return was confirmed. Please leave a review for the owner.',
          link: '/borrowed'
        });

        return res.json(request);
      } else {
        return res.status(400).json({ message: `Cannot transition from handed_over to ${status}` });
      }
    }

    return res.status(400).json({ message: `Request is already in a final state: ${request.status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify handover via QR Token or 6-digit PIN
// @route   POST /api/requests/:id/verify-handover
// @access  Private (Owner only)
exports.verifyHandover = async (req, res) => {
  try {
    const { token, pin } = req.body;
    const request = await BorrowRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Owner authorization
    if (request.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only the resource owner can verify handover' });
    }

    // Check request state
    if (request.status !== 'accepted') {
      return res.status(400).json({ 
        message: `Request must be in 'accepted' status to verify handover. Current status: ${request.status}` 
      });
    }

    // Verify token or PIN
    const providedToken = token ? String(token).trim() : '';
    const providedPin = pin ? String(pin).trim() : '';

    const tokenMatches = Boolean(
      providedToken && (
        providedToken === request.handoverToken ||
        providedToken === `Handover Req: ${request._id}` ||
        providedToken === request._id.toString()
      )
    );

    const pinMatches = Boolean(
      providedPin && (providedPin === request.handoverPin)
    );

    if (!tokenMatches && !pinMatches) {
      return res.status(400).json({ 
        message: 'Invalid verification token or PIN. Please ensure the borrower displays the correct code.' 
      });
    }

    // Mark as handed over
    request.status = 'handed_over';
    request.handoverVerifiedAt = new Date();
    const updatedRequest = await request.save();

    // Ensure item is marked unavailable
    await Item.findByIdAndUpdate(request.item, { isAvailable: false });

    // Notify borrower
    await createNotification({
      user: request.borrower,
      sender: req.user.id,
      type: 'handover_completed',
      title: 'Handover Verified! 🤝',
      message: 'Your resource handover was verified by the owner. Enjoy using the item!',
      link: '/borrowed'
    });

    res.json({
      message: 'Handover verified successfully',
      request: updatedRequest
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
