const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'Not authenticated' });
};

const ensureAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user?.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admins only' });
};

module.exports = { ensureAuthenticated, ensureAdmin };
