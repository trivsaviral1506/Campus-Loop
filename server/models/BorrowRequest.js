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
      enum: ['pending', 'accepted', 'rejected', 'cancelled', 'handed_over', 'returned'],
      default: 'pending'
    },
    handoverToken: { type: String, default: null },
    handoverPin: { type: String, default: null },
    handoverVerifiedAt: { type: Date, default: null },
    returnedAt: { type: Date, default: null }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

borrowRequestSchema.virtual('isOverdue').get(function () {
  return (this.status === 'handed_over' || this.status === 'accepted') && new Date() > new Date(this.endDate);
});

module.exports = mongoose.model('BorrowRequest', borrowRequestSchema);
