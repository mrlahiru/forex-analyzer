import axios from 'axios';

// Create configured Axios instance pointing to /api via Vite proxy
export const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchHealth = async () => {
  try {
    const startTime = Date.now();
    const response = await api.get('/health');
    const latency = Date.now() - startTime;
    return {
      success: true,
      data: response.data,
      latency,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to reach backend',
      latency: null,
    };
  }
};

export const fetchMarkets = async () => {
  try {
    const response = await api.get('/markets');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const fetchCandles = async (pair, timeframe = '1h', limit = 100) => {
  try {
    const cleanPair = pair.replace('/', '');
    const response = await api.get(`/markets/${cleanPair}/candles`, {
      params: { timeframe, limit },
    });
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const fetchProviderStatus = async () => {
  try {
    const response = await api.get('/markets/status');
    return {
      success: true,
      data: response.data?.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Phase 3: Technical Analysis Endpoints
export const fetchAnalysis = async (pair, timeframe = '1h') => {
  try {
    const cleanPair = pair.replace('/', '');
    const response = await api.get(`/analysis/${cleanPair}`, {
      params: { timeframe },
    });
    return {
      success: true,
      data: response.data?.analysis,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const fetchMultiTimeframeAnalysis = async (pair) => {
  try {
    const cleanPair = pair.replace('/', '');
    const response = await api.get(`/analysis/${cleanPair}/multi-timeframe`);
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Phase 4: Deterministic Signal Engine Endpoints
export const fetchActiveSignals = async () => {
  try {
    const response = await api.get('/signals/active');
    return {
      success: true,
      data: response.data?.signals,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const evaluatePairSignal = async (pair, timeframe = '1h') => {
  try {
    const cleanPair = pair.replace('/', '');
    const response = await api.get(`/signals/evaluate/${cleanPair}`, {
      params: { timeframe },
    });
    return {
      success: true,
      data: response.data?.signal,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const evaluateAllSignals = async (timeframe = '1h') => {
  try {
    const response = await api.get('/signals/evaluate', {
      params: { timeframe },
    });
    return {
      success: true,
      data: response.data?.signals,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Phase 5: Dynamic TP/SL & Risk Calculator Endpoints
export const calculateRisk = async (riskParams) => {
  try {
    const response = await api.post('/risk/calculate', riskParams);
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const fetchRiskParameters = async (pair, direction = 'BUY', timeframe = '1h') => {
  try {
    const cleanPair = pair.replace('/', '');
    const response = await api.get(`/risk/parameters/${cleanPair}`, {
      params: { direction, timeframe },
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Phase 7: OpenAI Intelligence & Setup Synthesis
export const fetchAiExplanation = async (pair, timeframe = '1h') => {
  try {
    const cleanPair = pair.replace('/', '');
    const response = await api.get(`/ai/explain/${cleanPair}`, {
      params: { timeframe },
    });
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Phase 8: Automatic Market Scanner Endpoints
export const fetchScannerStatus = async () => {
  try {
    const response = await api.get('/scanner/status');
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const triggerManualScan = async (timeframe = '1h') => {
  try {
    const response = await api.post('/scanner/run', { timeframe });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const fetchScannerEvents = async (limit = 25) => {
  try {
    const response = await api.get('/scanner/events', {
      params: { limit },
    });
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Phase 9: Telegram Notifications & Alerts Endpoints
export const fetchNotificationStatus = async () => {
  try {
    const response = await api.get('/notifications/status');
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const sendTestNotification = async () => {
  try {
    const response = await api.post('/notifications/test');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const updateNotificationSettings = async (settings) => {
  try {
    const response = await api.post('/notifications/settings', settings);
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

// Phase 10: Backtesting Engine Endpoints
export const runBacktest = async (params) => {
  try {
    const response = await api.post('/backtest/run', params);
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const fetchBacktestResults = async () => {
  try {
    const response = await api.get('/backtest/results');
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const fetchBacktestStrategies = async () => {
  try {
    const response = await api.get('/backtest/strategies');
    return {
      success: true,
      data: response.data?.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export default api;

