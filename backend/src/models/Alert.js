import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    signalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Signal',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      enum: ['telegram', 'websocket', 'email', 'in_app'],
      default: 'telegram',
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending',
    },
    sentAt: {
      type: Date,
    },
    error: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
