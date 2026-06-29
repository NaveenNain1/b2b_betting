import axios from 'axios';

const BASE_URL = 'https://b2b.madarchod.tech/api/tenant';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tenant_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tenant_token');
      localStorage.removeItem('tenant_user');
      localStorage.removeItem('tenant_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const register = (data) => api.post('/register', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const login = (data) => api.post('/login', data);
export const me = () => api.get('/me');

// Profile
export const updateProfile = (data) => api.patch('/profile', data);
export const changePassword = (data) => api.patch('/security/password', data);
export const setup2fa = () => api.post('/security/2fa/setup');
export const enable2fa = (data) => api.post('/security/2fa/enable', data);
export const disable2fa = (data) => api.post('/security/2fa/disable', data);

// Users
export const listUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
export const updateUserPassword = (id, data) => api.patch(`/users/${id}/password`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getPermissions = () => api.get('/permissions');

// Plans & Subscription
export const getPlans = () => api.get('/plans');
export const updateSubscription = (data) => api.patch('/subscription', data);
export const getPaymentNetworks = () => api.get('/payment/networks');
export const initiatePayment = (data) => api.post('/payment/initiate', data);

// KYC
export const getKycSettings = () => api.get('/kyc-settings');
export const saveKycSettings = (data) => api.put('/kyc-settings', data);

// Logs
export const loginLogs = (params) => api.get('/logs/login', { params });
export const activityLogs = (params) => api.get('/logs/activity', { params });

// Maintenance
export const updateMaintenance = (data) => api.patch('/maintenance-mode', data);

// Domains
export const connectDomain = (data) => api.post('/domains', data);
export const getDnsRecords = () => api.get('/dns-records');

// Themes
export const getThemes = () => api.get('/themes');
export const updateTheme = (data) => api.put('/themes', data, { headers: { 'Content-Type': 'multipart/form-data' } });

// Sessions
export const mySessions = () => api.get('/sessions');
export const logoutSession = (id) => api.delete(`/sessions/${id}`);

export default api;
