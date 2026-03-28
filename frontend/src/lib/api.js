import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL;
let baseURL = '';

if (rawBaseURL) {
  baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;
} else {
  // Fallback for local development
  baseURL = 'http://localhost:8000/api/';
  
  // Warning for production
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.warn('WARNING: VITE_API_URL is not set. API calls will likely fail on production.');
  }
}

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.log(`[API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // Don't refresh if it's the login or refresh request itself that failed
    const isAuthRequest = original.url.includes('/auth/login/') || original.url.includes('/auth/token/refresh/');
    
    if (error.response?.status === 401 && !original._retry && !isAuthRequest) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) {
          throw new Error('No refresh token');
        }
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/token/refresh/`,
          { refresh }
        );
        localStorage.setItem('access_token', res.data.access);
        original.headers.Authorization = `Bearer ${res.data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
