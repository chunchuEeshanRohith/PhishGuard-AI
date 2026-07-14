import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5005/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const predictUrl = async (url) => {
  try {
    const response = await api.post('/predict', { url });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Server error occurred.');
    } else if (error.request) {
      throw new Error('Network error or backend is offline. Please ensure the server is running.');
    } else {
      throw new Error(error.message);
    }
  }
};

export default api;
