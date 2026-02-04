import axios from 'axios';

// Support both CRA-style and Vite-style env vars, and fall back to local dev default
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Use the FastAPI paths, which are all under /api/*
export const analyzeTransaction = async (transactionData) => {
  const response = await api.post('/api/analyze', transactionData);
  return response.data;
};

export const getTransactionById = async (transactionId) => {
  const response = await api.get(`/api/transactions/${transactionId}`);
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get('/api/transactions');
  return response.data;
};

export const getStats = async () => {
  const response = await api.get('/api/stats');
  return response.data;
};

export default api;