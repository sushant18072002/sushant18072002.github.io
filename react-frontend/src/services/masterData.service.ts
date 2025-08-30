import { apiService } from './api';

export interface Country {
  _id: string;
  name: string;
  code: string;
  code3: string;
  currency: string;
  timezone: string;
  continent: string;
  flag: string;
  status: string;
}

export interface State {
  _id: string;
  name: string;
  code: string;
  country: Country;
  timezone: string;
  status: string;
}

export interface City {
  _id: string;
  name: string;
  state?: State;
  country: Country;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timezone: string;
  description: string;
  images: string[];
  popularFor: string[];
  bestTimeToVisit: string[];
  status: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  parentCategory?: Category;
  type: string;
  order: number;
  status: string;
}

export interface Activity {
  _id: string;
  name: string;
  description: string;
  category: Category;
  city: City;
  duration: number;
  difficulty: string;
  groupSize: {
    min: number;
    max: number;
  };
  pricing: {
    currency: string;
    adult: number;
    child: number;
    group: number;
  };
  includes: string[];
  excludes: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  status: string;
}

export const masterDataService = {
  // Countries
  getCountries: async (): Promise<{ countries: Country[] }> => {
    const response = await apiService.get('/master/countries');
    return response.data;
  },

  // States by country
  getStatesByCountry: async (countryId: string): Promise<{ states: State[] }> => {
    const response = await apiService.get(`/master/states/${countryId}`);
    return response.data;
  },

  // Cities
  getCities: async (filters?: {
    stateId?: string;
    countryId?: string;
    search?: string;
  }): Promise<{ cities: City[] }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await apiService.get(`/master/cities?${params.toString()}`);
    return response.data;
  },

  // Search cities
  searchCities: async (query: string): Promise<{ cities: City[] }> => {
    const response = await apiService.get(`/master/cities?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Categories
  getCategories: async (type?: string): Promise<{ categories: Category[] }> => {
    const params = type ? `?type=${type}` : '';
    const response = await apiService.get(`/master/categories${params}`);
    return response.data;
  },

  // Activities
  getActivities: async (filters?: {
    cityId?: string;
    categoryId?: string;
    search?: string;
  }): Promise<{ activities: Activity[] }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    
    const response = await apiService.get(`/master/activities?${params.toString()}`);
    return response.data;
  },

  // Admin APIs
  getAdminCountries: async (): Promise<{ countries: Country[] }> => {
    const response = await apiService.get('/master/admin/countries');
    return response.data;
  },

  createCountry: async (countryData: Partial<Country>) => {
    const response = await apiService.post('/master/admin/countries', countryData);
    return response.data;
  },

  updateCountry: async (id: string, countryData: Partial<Country>) => {
    const response = await apiService.put(`/master/admin/countries/${id}`, countryData);
    return response.data;
  },

  deleteCountry: async (id: string) => {
    const response = await apiService.delete(`/master/admin/countries/${id}`);
    return response.data;
  },

  // States
  getAdminStates: async (): Promise<{ states: State[] }> => {
    const response = await apiService.get('/admin/master/states');
    return response.data;
  },

  createState: async (stateData: Partial<State>) => {
    const response = await apiService.post('/admin/master/states', stateData);
    return response.data;
  },

  updateState: async (id: string, stateData: Partial<State>) => {
    const response = await apiService.put(`/admin/master/states/${id}`, stateData);
    return response.data;
  },

  // Cities
  getAdminCities: async (page = 1, limit = 50): Promise<{ cities: City[]; pagination: any }> => {
    const response = await apiService.get(`/master/admin/cities?page=${page}&limit=${limit}`);
    return response.data;
  },

  createCity: async (cityData: Partial<City>) => {
    const response = await apiService.post('/master/admin/cities', cityData);
    return response.data;
  },

  updateCity: async (id: string, cityData: Partial<City>) => {
    const response = await apiService.put(`/master/admin/cities/${id}`, cityData);
    return response.data;
  },

  // Categories
  getAdminCategories: async (): Promise<{ categories: Category[] }> => {
    const response = await apiService.get('/master/admin/categories');
    return response.data;
  },

  createCategory: async (categoryData: Partial<Category>) => {
    const response = await apiService.post('/master/admin/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    const response = await apiService.put(`/master/admin/categories/${id}`, categoryData);
    return response.data;
  },

  // Activities
  getAdminActivities: async (page = 1, limit = 50): Promise<{ activities: Activity[]; pagination: any }> => {
    const response = await apiService.get(`/master/admin/activities?page=${page}&limit=${limit}`);
    return response.data;
  },

  createActivity: async (activityData: Partial<Activity>) => {
    const response = await apiService.post('/master/admin/activities', activityData);
    return response.data;
  },

  updateActivity: async (id: string, activityData: Partial<Activity>) => {
    const response = await apiService.put(`/master/admin/activities/${id}`, activityData);
    return response.data;
  }
};