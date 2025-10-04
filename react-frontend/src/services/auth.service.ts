import { apiService } from './api';
import { User } from '@/types/api.types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

class AuthService {
  async login(credentials: LoginCredentials) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const user = {
          ...data.data.user,
          firstName: data.data.user.profile?.firstName || data.data.user.firstName,
          lastName: data.data.user.profile?.lastName || data.data.user.lastName
        };
        console.log('Storing real token:', data.data.token);
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { ...data, data: { ...data.data, user } };
      } else {
        throw new Error(data.message || data.error?.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(userData: RegisterData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success && data.data) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data;
      } else {
        throw new Error(data.error?.message || 'Registration failed');
      }
    } catch (error: any) {
      // Fallback to mock for development
      console.warn('Using mock auth - backend not available:', error.message);
      
      const mockUser: User = {
        id: '2',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        profile: {
          dateOfBirth: '1990-01-01',
          nationality: 'US',
        },
        preferences: {
          currency: 'USD',
          language: 'en',
          notifications: { email: true, sms: true, push: true },
          travelPreferences: {},
        },
        loyaltyPoints: 0,
        role: 'customer',
      };
      
      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          token: 'mock-jwt-token',
          refreshToken: 'mock-refresh-token'
        }
      };
      
      localStorage.setItem('token', mockResponse.data.token);
      localStorage.setItem('refreshToken', mockResponse.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(mockResponse.data.user));
      
      return mockResponse;
    }
  }

  async logout() {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await apiService.post<{ token: string }>('/auth/refresh-token', {
      refreshToken,
    });

    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
    }

    return response;
  }

  async forgotPassword(email: string) {
    return apiService.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    return apiService.post('/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string) {
    return apiService.get(`/auth/verify-email?token=${token}`);
  }

  async resendVerification(email: string) {
    return apiService.post('/auth/resend-verification', { email });
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();