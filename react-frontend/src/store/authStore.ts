import { create } from 'zustand';
import { User } from '@/types/api.types';
import { authService, LoginCredentials, RegisterData } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login(credentials);
      
      if (response.success && response.data) {
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.register(userData);
      
      if (response.success && response.data) {
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  initializeAuth: () => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    
    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));