import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and workspace ID
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    const workspaceId = Cookies.get('workspaceId');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (workspaceId) {
      config.headers['x-workspace-id'] = workspaceId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors (401, 403)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (logout, redirect to login)
      Cookies.remove('token');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
