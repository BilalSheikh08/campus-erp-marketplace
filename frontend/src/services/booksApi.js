import api from '../api/client.js';

export const fetchBooks = async (params = {}) => {
  const response = await api.get('/api/books/', { params });
  return response.data;
};

export const fetchBook = async (id) => {
  const response = await api.get(`/api/books/${id}/`);
  return response.data;
};

export const createBook = async (payload) => {
  const response = await api.post('/api/books/', payload);
  return response.data;
};

export const reserveBook = async (id) => {
  const response = await api.post(`/api/books/${id}/reserve/`);
  return response.data;
};

export const confirmBookSale = async (id) => {
  const response = await api.post(`/api/books/${id}/confirm-sale/`);
  return response.data;
};

export const fetchMyBookListings = async (params = {}) => {
  const response = await api.get('/api/books/my-listings/', { params });
  return response.data;
};

export const fetchMyBookTransactions = async (params = {}) => {
  const response = await api.get('/api/books/my-transactions/', { params });
  return response.data;
};

export const completeBookTransaction = async (id) => {
  const response = await api.post(`/api/books/transactions/${id}/complete/`);
  return response.data;
};

export const cancelBookTransaction = async (id) => {
  const response = await api.post(`/api/books/transactions/${id}/cancel/`);
  return response.data;
};
