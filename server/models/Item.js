const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
    deposit: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    pickupLocation: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
