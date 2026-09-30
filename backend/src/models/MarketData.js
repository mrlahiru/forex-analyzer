import mongoose from 'mongoose';

const marketDataSchema = new mongoose.Schema(
  {
    pair: {
      type: String,
      required: true,
      index: true,
    },
    timeframe: {
      type: String,
      required: true,
      index: true,
      enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d'],
    },
    timestamp: {
      type: Date,
      required: true,
      index: true,
    },
    open: {
      type: Number,
      required: true,
    },
    high: {
      type: Number,
      required: true,
    },
    low: {
      type: Number,
      required: true,
    },
    close: {
      type: Number,
      required: true,
    },
    volume: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying candlestick series efficiently
marketDataSchema.index({ pair: 1, timeframe: 1, timestamp: -1 });

export const MarketData = mongoose.model('MarketData', marketDataSchema);
export default MarketData;
