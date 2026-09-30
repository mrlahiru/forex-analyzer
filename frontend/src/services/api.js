import axios from 'axios';

// Create configured Axios instance
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

export default api;
