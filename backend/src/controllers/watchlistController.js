import mongoose from 'mongoose';
import User from '../models/User.js';
import { marketDataManager } from '../services/marketData/index.js';

// Fallback in-memory guest watchlist
let guestWatchlist = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];

export const getWatchlist = async (req, res, next) => {
  try {
    let pairs = guestWatchlist;

    if (req.user && mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id || req.user.id);
      if (user && user.watchlist) {
        pairs = user.watchlist;
      }
    } else if (req.user && req.user.watchlist) {
      pairs = req.user.watchlist;
    }

    // Enhance with latest quote for each pair
    const quotes = await Promise.allSettled(
      pairs.map((p) => marketDataManager.getQuote(p))
    );

    const items = pairs.map((pair, index) => {
      const quoteRes = quotes[index];
      const quote = quoteRes.status === 'fulfilled' ? quoteRes.value : null;

      return {
        pair,
        price: quote ? quote.price : null,
        change: quote ? quote.change : 0,
        changePercent: quote ? quote.changePercent : 0,
        high: quote ? quote.high : null,
        low: quote ? quote.low : null,
        isPositive: quote ? quote.change >= 0 : true,
      };
    });

    res.status(200).json({
      success: true,
      count: items.length,
      pairs,
      watchlist: items,
    });
  } catch (error) {
    next(error);
  }
};

export const addToWatchlist = async (req, res, next) => {
  try {
    const { pair } = req.body;
    if (!pair) {
      return res.status(400).json({ success: false, message: 'Pair is required' });
    }

    const normPair = marketDataManager.normalizePair(pair);

    if (req.user && mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id || req.user.id);
      if (user) {
        if (!user.watchlist.includes(normPair)) {
          user.watchlist.push(normPair);
          await user.save();
        }
        return res.status(200).json({
          success: true,
          message: `${normPair} added to watchlist`,
          watchlist: user.watchlist,
        });
      }
    }

    // Guest / fallback
    if (!guestWatchlist.includes(normPair)) {
      guestWatchlist.push(normPair);
    }

    res.status(200).json({
      success: true,
      message: `${normPair} added to watchlist`,
      watchlist: guestWatchlist,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromWatchlist = async (req, res, next) => {
  try {
    const { pair } = req.params;
    const normPair = marketDataManager.normalizePair(pair);

    if (req.user && mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id || req.user.id);
      if (user) {
        user.watchlist = user.watchlist.filter((p) => p !== normPair);
        await user.save();
        return res.status(200).json({
          success: true,
          message: `${normPair} removed from watchlist`,
          watchlist: user.watchlist,
        });
      }
    }

    // Guest / fallback
    guestWatchlist = guestWatchlist.filter((p) => p !== normPair);

    res.status(200).json({
      success: true,
      message: `${normPair} removed from watchlist`,
      watchlist: guestWatchlist,
    });
  } catch (error) {
    next(error);
  }
};
