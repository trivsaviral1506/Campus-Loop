const Message = require('../models/Message');
const BorrowRequest = require('../models/BorrowRequest');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get messages for a borrowing request
// @route   GET /api/messages/request/:requestId
// @access  Private
exports.getRequestMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await BorrowRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Check authorization: only borrower, owner, or admin
    const isBorrower = request.borrower.toString() === req.user.id;
    const isOwner = request.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isBorrower && !isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this exchange' });
    }

    const messages = await Message.find({ request: requestId })
      .populate('sender', 'name role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message regarding a borrowing request
// @route   POST /api/messages/request/:requestId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const request = await BorrowRequest.findById(requestId).populate('item', 'name');

    if (!request) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    const isBorrower = request.borrower.toString() === req.user.id;
    const isOwner = request.owner.toString() === req.user.id;

    if (!isBorrower && !isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this exchange' });
    }

    // Target recipient is the other party
    const recipient = isBorrower ? request.owner : request.borrower;

    const message = await Message.create({
      request: requestId,
      sender: req.user.id,
      recipient,
      content: content.trim()
    });

    const populated = await Message.findById(message._id).populate('sender', 'name role');

    // Notify recipient
    await createNotification({
      user: recipient,
      sender: req.user.id,
      type: 'new_message',
      title: `New message on "${request.item?.name || 'Item'}"`,
      message: `${populated.sender?.name || 'Someone'}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
      link: isBorrower ? '/lent' : '/borrowed'
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
