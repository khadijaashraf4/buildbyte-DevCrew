import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refresh on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${API_URL}auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccessToken = res.data.access;
          localStorage.setItem('access_token', newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token expired or invalid -> log out
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoint Wrappers
export const authAPI = {
  register: (data) => api.post('auth/register/', data),
  login: (email, password) => api.post('auth/login/', { email, password }),
  getProfile: () => api.get('auth/profile/'),
  updateProfile: (data) => api.put('auth/profile/', data),
};

export const skillsAPI = {
  list: () => api.get('skills/'),
  create: (name) => api.post('skills/', { name }),
};

export const projectsAPI = {
  list: () => api.get('projects/'),
  create: (data) => api.post('projects/', data),
  update: (id, data) => api.put(`projects/${id}/`, data),
  delete: (id) => api.delete(`projects/${id}/`),
};

export const workRecordsAPI = {
  list: () => api.get('work-records/'),
  create: (data) => api.post('work-records/', data),
  update: (id, data) => api.put(`work-records/${id}/`, data),
  delete: (id) => api.delete(`work-records/${id}/`),
  verify: (id, status, remarks) => api.post(`work-records/${id}/verify/`, { status, remarks }),
};

export const opportunitiesAPI = {
  list: (search = '', mine = false) => {
    let url = 'opportunities/';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (mine) params.push('mine=true');
    if (params.length > 0) url += `?${params.join('&')}`;
    return api.get(url);
  },
  retrieve: (id) => api.get(`opportunities/${id}/`),
  create: (data) => api.post('opportunities/', data),
  update: (id, data) => api.put(`opportunities/${id}/`, data),
  delete: (id) => api.delete(`opportunities/${id}/`),
  apply: (id, coverLetter) => api.post(`opportunities/${id}/apply/`, { cover_letter: coverLetter }),
};

export const applicationsAPI = {
  list: (oppId = null) => {
    let url = 'applications/';
    if (oppId) url += `?opportunity=${oppId}`;
    return api.get(url);
  },
  retrieve: (id) => api.get(`applications/${id}/`),
  shortlist: (id) => api.post(`applications/${id}/shortlist/`),
  reject: (id) => api.post(`applications/${id}/reject/`),
  reveal: (id) => api.post(`applications/${id}/reveal/`),
};

export default api;
