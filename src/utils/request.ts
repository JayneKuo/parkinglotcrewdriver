import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { showToast } from 'vant';
import router from '@/router';

interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    if (data.code === 0) {
      return data.data;
    }
    showToast(data.message || '请求失败');
    return Promise.reject(new Error(data.message || '请求失败'));
  },
  (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      router.push('/login');
    }
    showToast(error.message || '网络错误');
    return Promise.reject(error);
  }
);

export default request; 