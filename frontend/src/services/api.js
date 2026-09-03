import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('ner_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ner_token');
      localStorage.removeItem('ner_user');
    }
    return Promise.reject(error.response?.data || { message: 'Network error' });
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

// Roads
export const roadsAPI = {
  getAll: (params) => api.get('/roads', { params }),
  getById: (id) => api.get(`/roads/${id}`),
  getStats: () => api.get('/roads/stats/summary'),
  update: (id, data) => api.put(`/roads/${id}`, data)
};

// Vehicles
export const vehiclesAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  getMyVehicle: () => api.get('/vehicles/my-vehicle'),
  updateLocation: (id, data) => api.put(`/vehicles/${id}/location`, data),
  updateTelemetry: (id, data) => api.put(`/vehicles/${id}/location`, data),
  getStats: () => api.get('/vehicles/stats/summary')
};

// Incidents
export const incidentsAPI = {
  getAll: (params) => api.get('/incidents', { params }),
  getById: (id) => api.get(`/incidents/${id}`),
  create: (data) => api.post('/incidents', data),
  update: (id, data) => api.put(`/incidents/${id}`, data)
};

// Deliveries
export const deliveriesAPI = {
  getAll: (params) => api.get('/deliveries', { params }),
  getMyDeliveries: () => api.get('/deliveries/my-deliveries'),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  delete: (id) => api.delete(`/deliveries/${id}`)
};

// Districts
export const districtsAPI = {
  getAll: (params) => api.get('/districts', { params }),
  getById: (code) => api.get(`/districts/${code}`)
};

// Alerts
export const alertsAPI = {
  getAll: (params) => api.get('/alerts', { params }),
  create: (data) => api.post('/alerts', data),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  getUnreadCount: () => api.get('/alerts/unread/count')
};

// Weather
export const weatherAPI = {
  getAll: () => api.get('/weather'),
  getByDistrict: (district) => api.get(`/weather/${district}`)
};

// Field Reports
export const fieldReportsAPI = {
  getAll: (params) => api.get('/field-reports', { params }),
  create: (data) => api.post('/field-reports', data),
  syncBatch: (reports) => api.post('/field-reports/sync', { reports }),
  convertToIncident: (id) => api.put(`/field-reports/${id}/convert`)
};

// Routes & Alternative Corridors
export const routesAPI = {
  getAll: (params) => api.get('/routes', { params }),
  getById: (id) => api.get(`/routes/${id}`),
  selectReroute: (id, data) => api.put(`/routes/${id}/reroute`, data),
  acceptReroute: (id) => api.put(`/routes/${id}/accept-reroute`)
};

// Audit Logs
export const auditLogsAPI = {
  getAll: (params) => api.get('/audit-logs', { params })
};

// ML Predictions
export const predictAPI = {
  disruption: (data) => api.post('/predict/disruption', data),
  route: (data) => api.post('/predict/route', data),
  eta: (data) => api.post('/predict/eta', data)
};

// Analytics
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getIncidentsByType: () => api.get('/analytics/incidents-by-type'),
  getDeliveriesByStatus: () => api.get('/analytics/deliveries-by-status'),
  getRoadsByDistrict: () => api.get('/analytics/roads-by-district')
};

export default api;
