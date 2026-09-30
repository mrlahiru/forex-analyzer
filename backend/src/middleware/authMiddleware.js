import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * Require valid JWT authentication
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required (Bearer <token>)',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists',
        });
      }
      req.user = user;
    } else {
      // In-memory fallback if MongoDB is not running locally
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Institutional Trader',
        email: decoded.email,
        role: decoded.role || 'user',
        watchlist: decoded.watchlist || ['EUR/USD', 'GBP/USD', 'USD/JPY'],
        preferences: decoded.preferences || {
          defaultTimeframe: '1h',
          riskPercentage: 1.0,
          theme: 'dark',
        },
      };
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token',
      error: error.message,
    });
  }
};

/**
 * Optional Auth middleware - attaches user if token is valid, continues if not
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      if (mongoose.connection.readyState === 1) {
        const user = await User.findById(decoded.id).select('-password');
        if (user) req.user = user;
      } else {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          name: decoded.name || 'Institutional Trader',
          email: decoded.email,
          role: decoded.role || 'user',
        };
      }
    }
  } catch (err) {
    // Ignore invalid tokens in optional auth
  }
  next();
};

export default requireAuth;
