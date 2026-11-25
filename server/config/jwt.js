const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable must be set in production.');
    }
    return 'dev_only_campusloop_secret';
  }
  return secret;
};

module.exports = { getJwtSecret };
