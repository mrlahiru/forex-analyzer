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

export default api;
