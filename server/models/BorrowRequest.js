const mongoose = require('mongoose');

const borrowRequestSchema = new mongoose.Schema(
  {
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'rejected', 'handed_over', 'returned'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
