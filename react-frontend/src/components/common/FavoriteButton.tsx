import React, { useState, useEffect } from 'react';
import { favoritesService } from '@/services/favorites.service';
import { useAuthStore } from '@/store/authStore';

interface FavoriteButtonProps {
  itemId: string;
  itemType: string;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ itemId, itemType, className = '' }) => {
  const { isAuthenticated } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      checkFavoriteStatus();
    }
  }, [itemId, itemType, isAuthenticated]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await favoritesService.isFavorite(itemId, itemType);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Could trigger auth modal here
      return;
    }

    setLoading(true);
    try {
      if (isFavorite) {
        await favoritesService.removeFromFavorites(itemId, itemType);
        setIsFavorite(false);
      } else {
        await favoritesService.addToFavorites(itemId, itemType);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`p-2 rounded-lg transition-colors ${
        isFavorite
          ? 'text-red-500 hover:bg-red-50'
          : 'text-primary-400 hover:bg-primary-50 hover:text-red-500'
      } ${className}`}
    >
      {isFavorite ? '❤️' : '🤍'}
    </button>
  );
};

export default FavoriteButton;