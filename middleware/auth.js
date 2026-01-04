const User = require('../models/User');

// Check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Please login.' 
    });
  }
  next();
};

// Check if user is admin (role_id = 3)
const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Please login.' 
    });
  }
  
  // Check if user is admin (role_id = 3)
  if (req.session.role_id !== 3) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  next();
};

// Check if user is mitra (role_id = 2)
const requireMitra = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Please login.' 
    });
  }
  
  // Check  if user is mitra (role_id = 2)
  if (req.session.role_id !== 2) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Mitra privileges required.' 
    });
  }
  
  next();
};

// Check if user is regular user (role_id = 1)
const requireUser = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Please login.' 
    });
  }
  
  // Check if user is regular user (role_id = 1)
  if (req.session.role_id !== 1) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. User privileges required.' 
    });
  }
  
  next();
};

module.exports = {
  requireAuth,
  requireAdmin,
  requireMitra,
  requireUser
};