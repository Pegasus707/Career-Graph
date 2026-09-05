import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  paramsSerializer: {
    // Normalize and serialize structured payload queries, stripping null/undefined
    serialize: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params || {}).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          if (Array.isArray(val)) {
            val.forEach((item) => {
              if (item !== undefined && item !== null && item !== '') {
                searchParams.append(key, item);
              }
            });
          } else {
            searchParams.append(key, val);
          }
        }
      });
      return searchParams.toString();
    }
  }
});

// Request interceptor: Attach JWT authentication token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('cg_token');
      localStorage.removeItem('cg_user');
    }
    return Promise.reject(err);
  }
);

export default api;
