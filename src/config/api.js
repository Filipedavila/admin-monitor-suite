import axios from 'axios';
import { encodeBase64Url } from '../utils/utils.js';
const normalizeBaseUrl = (url) => {
  if (!url || typeof url !== 'string' || url === 'undefined') {
    return '';
  }
  return url.replace(/\/+$/, '');
};

export const getDefaultApiUrl = () => {
  const envUrl = import.meta?.env?.VITE_API_URL;
  return normalizeBaseUrl(envUrl);
}
const resolveBaseUrl = () => {
  if (typeof window === 'undefined') {
    return '/api';
  }

  const storedUrl = localStorage.getItem('@AMS:apiUrl');
  const base = normalizeBaseUrl(storedUrl || getDefaultApiUrl());

  return base ? `${base}/api` : '/api';
};

const api = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const refreshApiBaseUrl = () => {
  const nextBaseUrl = resolveBaseUrl();
  api.defaults.baseURL = nextBaseUrl;
  return nextBaseUrl;
};

export const createApiInstance = (token) => {
  return axios.create({
    baseURL: resolveBaseUrl(),
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined
    }
  });
};

export const getEvalDataByAPI = async (content, currentURLorHTML) => {
  if(content === "html") {
   return await api.post(`amp/eval/html`, { html: currentURLorHTML })
  } else {
   const encodedURL = encodeBase64Url(currentURLorHTML);
   return await api.get(`amp/eval/${encodeURIComponent(encodedURL)}`);  
  }
}

api.interceptors.request.use(
  (config) => {
    config.baseURL = refreshApiBaseUrl();
    const token = localStorage.getItem('@AMS:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const currentPath = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '';
      const isOnLoginPage = currentPath.endsWith('/login') || currentPath.includes('/login');
      if (!isOnLoginPage) {
        localStorage.removeItem('@AMS:user');
        localStorage.removeItem('@AMS:token');
        window.location = '/ams/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api };