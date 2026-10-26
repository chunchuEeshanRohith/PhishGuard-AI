import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictURL = async (url) => {
  try {
    const response = await api.post('/predict', { url });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error(error.response.data.error || error.response.data.message || 'API Error');
    }
    throw new Error('Unable to connect to the detection server. Please make sure the Flask backend is running.');
  }
};

export const checkHealth = async () => {
  try {
    // Health is at root, not /api based on backend
    const healthUrl = API_URL.replace('/api', '/health');
    const response = await axios.get(healthUrl);
    return response.data;
  } catch (error) {
    throw new Error('Backend is unavailable.');
  }
};

export const sendContactMessage = async (payload) => {
  try {
    const response = await api.post('/contact', payload);
    return { success: true, serviceUnavailable: false, data: response.data };
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404 || error.response.status === 501) {
        return {
          success: false,
          serviceUnavailable: true,
          message: 'Contact submission endpoint is not implemented on the server.',
        };
      }
      return {
        success: false,
        serviceUnavailable: false,
        message: error.response.data?.message || error.response.data?.error || 'Server error occurred.',
      };
    }
    return {
      success: false,
      serviceUnavailable: true,
      message: 'Unable to reach backend server.',
    };
  }
};
