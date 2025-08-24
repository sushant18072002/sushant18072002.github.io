import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface FavoriteItem {
  id: string;
  itemId: string;
  itemType: 'flight' | 'hotel' | 'package' | 'itinerary';
  title: string;
  subtitle: string;
  price: number;
  image: string;
  addedAt: string;
}

export const favoritesService = {
  getUserFavorites: (): Promise<ApiResponse<{ favorites: FavoriteItem[] }>> => {
    return apiClient.get('/favorites');
  },

  addToFavorites: (itemId: string, itemType: string): Promise<ApiResponse<{ favorite: FavoriteItem }>> => {
    return apiClient.post('/favorites', { itemId, itemType });
  },

  removeFromFavorites: (itemId: string, itemType: string): Promise<ApiResponse<{ success: boolean }>> => {
    return apiClient.delete(`/favorites/${itemType}/${itemId}`);
  },

  isFavorite: (itemId: string, itemType: string): Promise<ApiResponse<{ isFavorite: boolean }>> => {
    return apiClient.get(`/favorites/check/${itemType}/${itemId}`);
  }
};