const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowRequest', required: true, index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { 
      type: String, 
      enum: ['borrower_to_owner', 'owner_to_borrower'], 
      required: true 
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

// Prevent duplicate reviews on the same request by the same reviewer
reviewSchema.index({ request: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

