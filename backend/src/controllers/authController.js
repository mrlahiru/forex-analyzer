import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import config from '../config/index.js';

// In-memory fallback user registry if MongoDB is offline
const memoryUsers = new Map();

// Seed a default institutional trader account
const seedDefaultUser = async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('ForexAI@2026', salt);
  memoryUsers.set('trader@forexai.local', {
    _id: 'usr_demo_trader_001',
    id: 'usr_demo_trader_001',
    name: 'Institutional Trader',
    email: 'trader@forexai.local',
    password: hashedPassword,
    role: 'admin',
    watchlist: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'],
    preferences: {
      defaultTimeframe: '1h',
      notificationsEnabled: true,
      riskPercentage: 1.5,
      theme: 'dark',
    },
    createdAt: new Date().toISOString(),
  });
};
seedDefaultUser();

const generateToken = (user) => {
  const id = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    {
      id,
      name: user.name,
      email: user.email,
      role: user.role,
      watchlist: user.watchlist,
      preferences: user.preferences,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        watchlist: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
        preferences: {
          defaultTimeframe: '1h',
          notificationsEnabled: true,
          riskPercentage: 1.0,
          theme: 'dark',
        },
      });

      const token = generateToken(newUser);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          watchlist: newUser.watchlist,
          preferences: newUser.preferences,
        },
      });
    } else {
      // In-memory fallback
      if (memoryUsers.has(normalizedEmail)) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists',
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const id = `usr_${Date.now()}`;

      const newUser = {
        _id: id,
        id,
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'user',
        watchlist: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
        preferences: {
          defaultTimeframe: '1h',
          notificationsEnabled: true,
          riskPercentage: 1.0,
          theme: 'dark',
        },
      };

      memoryUsers.set(normalizedEmail, newUser);
      const token = generateToken(newUser);

      return res.status(201).json({
        success: true,
        message: 'User registered successfully (In-Memory Session)',
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          watchlist: newUser.watchlist,
          preferences: newUser.preferences,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = memoryUsers.get(normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        watchlist: user.watchlist,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const { preferences, name } = req.body;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      if (user) {
        if (preferences) user.preferences = { ...user.preferences, ...preferences };
        if (name) user.name = name.trim();
        await user.save();
        return res.status(200).json({
          success: true,
          message: 'Preferences updated',
          preferences: user.preferences,
        });
      }
    }

    // In-memory update
    const memUser = memoryUsers.get(req.user.email);
    if (memUser) {
      if (preferences) memUser.preferences = { ...memUser.preferences, ...preferences };
      if (name) memUser.name = name.trim();
    }

    return res.status(200).json({
      success: true,
      message: 'Preferences updated',
      preferences: preferences || req.user.preferences,
    });
  } catch (error) {
    next(error);
  }
};
