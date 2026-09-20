const Review = require('../models/Review');
const BorrowRequest = require('../models/BorrowRequest');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create a review for a completed transaction
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating) {
      return res.status(400).json({ message: 'Request ID and rating (1-5) are required' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    const request = await BorrowRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Borrow request not found' });
    }

    // Must be returned before review can be submitted
    if (request.status !== 'returned') {
      return res.status(400).json({ 
        message: 'Reviews can only be submitted after the item has been returned' 
      });
    }

    const isBorrower = request.borrower.toString() === req.user.id;
    const isOwner = request.owner.toString() === req.user.id;

    if (!isBorrower && !isOwner) {
      return res.status(403).json({ message: 'Forbidden: You are not a participant in this exchange' });
    }

    const reviewee = isBorrower ? request.owner : request.borrower;
    const targetType = isBorrower ? 'borrower_to_owner' : 'owner_to_borrower';

    // Check duplicate
    const existing = await Review.findOne({ request: requestId, reviewer: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You have already submitted a review for this transaction' });
    }

    const review = await Review.create({
      request: requestId,
      item: request.item,
      reviewer: req.user.id,
      reviewee,
      targetType,
      rating: numRating,
      comment: comment ? comment.trim() : ''
    });

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name college')
      .populate('reviewee', 'name');

    // Notify reviewee
    await createNotification({
      user: reviewee,
      sender: req.user.id,
      type: 'return_completed',
      title: 'New Review Received! ⭐',
      message: `You received a ${numRating}-star rating for your recent exchange.`,
      link: '/profile'
    });

    res.status(201).json(populatedReview);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate review. You have already reviewed this exchange.' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews received by a user
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name college department')
      .populate('item', 'name')
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
      : null;

    res.json({
      reviews,
      totalReviews,
      averageRating: averageRating ? Number(averageRating) : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a request
// @route   GET /api/reviews/request/:requestId
// @access  Private
exports.getRequestReviews = async (req, res) => {
  try {
    const { requestId } = req.params;
    const reviews = await Review.find({ request: requestId })
      .populate('reviewer', 'name');

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
