import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, PaginatedResponse } from '@/types/api.types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:3000/api/v1';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    // Handle admin routes differently
    const url = endpoint.startsWith('/admin') ? 
      `http://localhost:3000/api${endpoint}` : 
      endpoint;
    
    const response = endpoint.startsWith('/admin') ?
      await axios.get(url, { 
        params, 
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }) :
      await this.api.get(endpoint, { params });
    
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    // Handle admin routes differently
    const url = endpoint.startsWith('/admin') ? 
      `http://localhost:3000/api${endpoint}` : 
      endpoint;
    
    const response = endpoint.startsWith('/admin') ?
      await axios.post(url, data, { 
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }) :
      await this.api.post(endpoint, data);
    
    return response.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    // Handle admin routes differently
    const url = endpoint.startsWith('/admin') ? 
      `http://localhost:3000/api${endpoint}` : 
      endpoint;
    
    const response = endpoint.startsWith('/admin') ?
      await axios.put(url, data, { 
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }) :
      await this.api.put(endpoint, data);
    
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    // Handle admin routes differently
    const url = endpoint.startsWith('/admin') ? 
      `http://localhost:3000/api${endpoint}` : 
      endpoint;
    
    const response = endpoint.startsWith('/admin') ?
      await axios.delete(url, { 
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }) :
      await this.api.delete(endpoint);
    
    return response.data;
  }

  async getPaginated<T>(endpoint: string, params?: any): Promise<PaginatedResponse<T>> {
    const response = await this.api.get(endpoint, { params });
    return response.data;
  }
}

export const apiService = new ApiService();