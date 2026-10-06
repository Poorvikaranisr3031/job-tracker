import axios from 'axios';

const api = axios.create({
  baseURL: 'https://job-tracker-2-j356.onrender.com',
});

// Automatically attach the token to every request, if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;