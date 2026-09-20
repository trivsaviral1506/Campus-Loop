const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { 
      type: String, 
      enum: [
        'request_created', 
        'request_accepted', 
        'request_rejected', 
        'request_cancelled', 
        'handover_completed', 
        'return_completed', 
        'new_message', 
        'overdue_alert'
      ],
      required: true 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '/dashboard' },
    isRead: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
