import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    watchlist: {
      type: [String],
      default: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
    },
    preferences: {
      defaultTimeframe: {
        type: String,
        default: '1h',
        enum: ['1m', '5m', '15m', '30m', '1h', '4h', '1d'],
      },
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      riskPercentage: {
        type: Number,
        default: 1.0,
      },
      theme: {
        type: String,
        default: 'dark',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model('User', userSchema);
export default User;
