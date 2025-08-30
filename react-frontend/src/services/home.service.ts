import { apiService } from './api';

class HomeService {
  // Get featured content for homepage
  async getFeaturedContent() {
    return await apiService.get('/home/featured');
  }

  // Get platform statistics
  async getStats() {
    return await apiService.get('/home/stats');
  }

  // Get current deals and offers
  async getDeals() {
    return await apiService.get('/home/deals');
  }

  // Admin methods
  admin = {
    // Get homepage content settings
    async getHomeContent() {
      return await apiService.get('/admin/home/content');
    },

    // Update homepage content settings
    async updateHomeContent(data: any) {
      return await apiService.put('/admin/home/content', data);
    }
  };
}

export const homeService = new HomeService();