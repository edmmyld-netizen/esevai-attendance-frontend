import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL + '/api'
  : '/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('esevai_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('esevai_token');
      window.location.href = '/admin';
    }
    return Promise.reject(err);
  }
);

export default api;
