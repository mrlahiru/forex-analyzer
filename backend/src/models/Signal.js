import mongoose from 'mongoose';

const signalSchema = new mongoose.Schema(
  {
    pair: {
      type: String,
      required: true,
      index: true,
    },
    timeframe: {
      type: String,
      required: true,
      enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d'],
    },
    direction: {
      type: String,
      required: true,
      enum: ['BUY', 'SELL', 'NO_TRADE'],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    confidence: {
      type: String,
      enum: ['STRONG', 'MODERATE', 'WEAK', 'NONE'],
      default: 'MODERATE',
    },
    entry: {
      type: Number,
      required: true,
    },
    tp1: {
      type: Number,
      required: true,
    },
    tp2: {
      type: Number,
      required: true,
    },
    tp3: {
      type: Number,
      required: true,
    },
    stopLoss: {
      type: Number,
      required: true,
    },
    riskReward: {
      tp1: { type: Number, default: 1.0 },
      tp2: { type: Number, default: 2.0 },
      tp3: { type: Number, default: 3.0 },
    },
    reasons: {
      type: [String],
      default: [],
    },
    aiExplanation: {
      summary: String,
      marketStructure: String,
      keyRisks: [String],
      generatedAt: Date,
    },
    status: {
      type: String,
      enum: [
        'ACTIVE',
        'TP1_HIT',
        'TP2_HIT',
        'TP3_HIT',
        'SL_HIT',
        'EXPIRED',
        'CANCELLED',
      ],
      default: 'ACTIVE',
      index: true,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Signal = mongoose.model('Signal', signalSchema);
export default Signal;
