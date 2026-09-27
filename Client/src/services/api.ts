import axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5051/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s — accommodates ML inference time
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('metroverify_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // If backend is not available, we handle fallback gracefully in the service layer
    return Promise.reject(error);
  }
);

export async function requestWithFallback<T>(
  apiCall: () => Promise<any>,
  fallbackFn: () => T | Promise<T>
): Promise<T> {
  try {
    const res = await apiCall();
    if (res && res.data && typeof res.data === 'object' && 'success' in res.data && 'data' in res.data) {
      return res.data.data as T;
    }
    if (res && typeof res === 'object' && 'data' in res) {
      return res.data as T;
    }
    return res as T;
  } catch (error) {
    // Backend unreachable or network error, execute mock fallback
    return await fallbackFn();
  }
}
