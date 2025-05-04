import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const fetchQuestions = async (params = {}) => {
  try {
    const response = await api.get('/questions', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const searchQuestions = async (params = {}) => {
  try {
    const response = await api.get('/questions/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching questions:', error);
    throw error;
  }
};

export default api;