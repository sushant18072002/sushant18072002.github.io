import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api.types';

export interface Company {
  _id: string;
  name: string;
  legalName?: string;
  contact: {
    email: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    };
  };
  settings: {
    currency: string;
    travelPolicy: {
      requireApproval: boolean;
      approvalLimits: Array<{
        role: string;
        maxAmount: number;
        currency: string;
      }>;
      allowedBookingWindow: number;
    };
    budgetControls: {
      enabled: boolean;
      departmentBudgets: Array<{
        department: string;
        annualBudget: number;
        spentAmount: number;
        currency: string;
      }>;
    };
  };
  stats: {
    totalEmployees: number;
    activeBookings: number;
    totalSpent: number;
  };
}

export interface CorporateBooking {
  _id: string;
  bookingReference: string;
  type: 'flight' | 'hotel' | 'package' | 'trip' | 'multi-city' | 'group';
  corporate: {
    department: string;
    project?: string;
    purpose: string;
    purposeDescription?: string;
    approval: {
      required: boolean;
      status: 'pending' | 'approved' | 'rejected' | 'auto-approved';
      approvedBy?: string;
      approvedAt?: string;
      rejectionReason?: string;
    };
    budget: {
      allocated: number;
      spent: number;
      remaining: number;
    };
  };
  travelers: Array<{
    employee: {
      firstName: string;
      lastName: string;
      email: string;
      department: string;
    };
    isPrimary: boolean;
  }>;
  pricing: {
    basePrice: number;
    corporateDiscount?: {
      type: 'percentage' | 'fixed';
      value: number;
      amount: number;
    };
    total: number;
    currency: string;
  };
  status: string;
  travelDates: {
    departure: string;
    return?: string;
  };
  createdAt: string;
  bookedBy: {
    profile: {
      firstName: string;
      lastName: string;
    };
    email: string;
  };
}

export interface Employee {
  _id: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
  };
  corporate: {
    department: string;
    designation?: string;
    approvalLimit: number;
    canApprove: boolean;
    permissions: string[];
    joinedAt: string;
  };
  status: string;
}

export const corporateService = {
  // Company management
  createCompany: (companyData: Partial<Company>): Promise<ApiResponse<{ company: Company }>> => {
    return apiClient.post('/corporate/companies', companyData);
  },

  getCompanyDetails: (): Promise<ApiResponse<{ company: Company }>> => {
    return apiClient.get('/corporate/companies/me');
  },

  updateCompanySettings: (settings: Partial<Company['settings']>): Promise<ApiResponse<{ company: Company }>> => {
    return apiClient.put('/corporate/companies/settings', { settings });
  },

  getCompanyDashboard: (): Promise<ApiResponse<{
    stats: {
      totalEmployees: number;
      activeBookings: number;
      pendingApprovals: number;
      monthlySpend: number;
    };
    recentBookings: CorporateBooking[];
    departmentSpending: Array<{
      _id: string;
      totalSpent: number;
      bookingCount: number;
    }>;
  }>> => {
    return apiClient.get('/corporate/companies/dashboard');
  },

  // Employee management
  addEmployee: (employeeData: {
    email: string;
    department: string;
    designation?: string;
    approvalLimit?: number;
    canApprove?: boolean;
    permissions?: string[];
  }): Promise<ApiResponse<{ user: Employee }>> => {
    return apiClient.post('/corporate/companies/employees', employeeData);
  },

  getCompanyEmployees: (params?: {
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    employees: Employee[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }>> => {
    return apiClient.get('/corporate/companies/employees', { params });
  },

  updateEmployeePermissions: (employeeId: string, updates: {
    department?: string;
    designation?: string;
    approvalLimit?: number;
    canApprove?: boolean;
    permissions?: string[];
  }): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.put(`/corporate/companies/employees/${employeeId}`, updates);
  },

  // Corporate bookings
  createCorporateBooking: (bookingData: {
    type: string;
    corporate: {
      department: string;
      project?: string;
      purpose: string;
      purposeDescription?: string;
    };
    travelers: Array<{
      employee: {
        firstName: string;
        lastName: string;
        email: string;
        department: string;
      };
    }>;
    bookingDetails: any;
    travelDates: {
      departure: string;
      return?: string;
    };
    specialRequests?: string;
  }): Promise<ApiResponse<{ 
    booking: CorporateBooking;
    requiresApproval: boolean;
    message: string;
  }>> => {
    return apiClient.post('/corporate/bookings', bookingData);
  },

  getCompanyBookings: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    department?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    bookings: CorporateBooking[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }>> => {
    return apiClient.get('/corporate/bookings', { params });
  },

  getBookingAnalytics: (params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }): Promise<ApiResponse<{
    overview: {
      totalBookings: number;
      totalSpent: number;
      avgBookingValue: number;
    };
    departmentStats: Array<{
      _id: string;
      count: number;
      totalSpent: number;
      avgSpent: number;
    }>;
  }>> => {
    return apiClient.get('/corporate/bookings/analytics', { params });
  },

  // Approval workflow
  getPendingApprovals: (): Promise<ApiResponse<{ bookings: CorporateBooking[] }>> => {
    return apiClient.get('/corporate/approvals/pending');
  },

  approveBooking: (bookingId: string, action: 'approve' | 'reject', data: {
    notes?: string;
    reason?: string;
  }): Promise<ApiResponse<{ booking: CorporateBooking; message: string }>> => {
    return apiClient.post(`/corporate/bookings/${bookingId}/approve`, { action, ...data });
  }
};