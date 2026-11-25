const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, getJwtSecret());
      req.user = decoded; // we store { id, role } in token
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
  if (req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden: Admin access required' });
};

module.exports = { protect, admin };
