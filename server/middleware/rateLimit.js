/**
 * Lightweight in-memory rate limiter middleware for Express.
 */
const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    const record = hits.get(key);

    if (!record || now > record.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    record.count += 1;
    if (record.count > max) {
      return res.status(429).json({ message });
    }

    return next();
  };
};

module.exports = { createRateLimiter };
