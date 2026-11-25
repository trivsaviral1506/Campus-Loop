const Notification = require('../models/Notification');

const createNotification = async ({ user, sender, type, title, message, link }) => {
  try {
    const notification = await Notification.create({
      user,
      sender,
      type,
      title,
      message,
      link: link || '/dashboard'
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };

