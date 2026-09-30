import mongoose from 'mongoose';

const signalEventSchema = new mongoose.Schema(
  {
    signalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Signal',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['CREATED', 'ENTRY_HIT', 'TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT', 'EXPIRED', 'CANCELLED'],
    },
    price: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const SignalEvent = mongoose.model('SignalEvent', signalEventSchema);
export default SignalEvent;
