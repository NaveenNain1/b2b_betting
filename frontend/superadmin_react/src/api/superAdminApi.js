import axios from 'axios';

const BASE_URL = 'http://localhost:3000/super-admin';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sa_token');
      localStorage.removeItem('sa_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/login', data);
export const bootstrap = (data) => api.post('/bootstrap', data);

// Security
export const changePassword = (data) => api.patch('/security/password', data);
export const setup2fa = () => api.post('/security/2fa/setup');
export const enable2fa = (data) => api.post('/security/2fa/enable', data);
export const disable2fa = (data) => api.post('/security/2fa/disable', data);

// Tenants
export const listTenants = () => api.get('/tenants');
export const createTenant = (data) => api.post('/tenants', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateTenant = (id, data) => api.patch(`/tenants/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const banTenant = (id, data) => api.patch(`/tenants/${id}/ban`, data);
export const tenantUsers = (id) => api.get(`/tenants/${id}/users`);

// Plans
export const listPlans = () => api.get('/plans');
export const createPlan = (data) => api.post('/plans', data);
export const updatePlan = (id, data) => api.patch(`/plans/${id}`, data);
export const deletePlan = (id) => api.delete(`/plans/${id}`);

// Oxapay
export const getOxapay = () => api.get('/oxapay');
export const updateOxapay = (data) => api.put('/oxapay', data);

// Logs
export const loginLogs = (params) => api.get('/logs/login', { params });
export const tenantLoginLogs = (params) => api.get('/logs/tenant-login', { params });

// Sessions
export const mySessions = () => api.get('/sessions');
export const logoutSession = (id) => api.delete(`/sessions/${id}`);

export default api;
