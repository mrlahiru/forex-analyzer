import mongoose from 'mongoose';
import config from './index.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB] Connection warning: ${error.message}`);
    console.warn('[MongoDB] Server will continue running. Ensure MongoDB Atlas or local MongoDB is active.');
  }

  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log('[MongoDB] Connection state: Connected');
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.log('[MongoDB] Connection state: Disconnected');
  });

  mongoose.connection.on('error', (err) => {
    isConnected = false;
    console.error(`[MongoDB] Connection error: ${err.message}`);
  });
};

export const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    connected: stateCode === 1,
    state: states[stateCode] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

export default connectDB;
