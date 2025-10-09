import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { corporateService } from '@/services/corporate.service';

const companySetupSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  legalName: z.string().optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  
  // Address
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  
  // Settings
  currency: z.string().default('USD'),
  requireApproval: z.boolean().default(true),
  allowedBookingWindow: z.number().min(1).max(365).default(30),
  
  // Initial departments
  departments: z.string().min(1, 'At least one department is required')
});

type CompanySetupFormData = z.infer<typeof companySetupSchema>;

const CorporateSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const form = useForm<CompanySetupFormData>({
    resolver: zodResolver(companySetupSchema),
    defaultValues: {
      name: '',
      legalName: '',
      email: user?.email || '',
      phone: '',
      website: '',
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      currency: 'USD',
      requireApproval: true,
      allowedBookingWindow: 30,
      departments: 'IT, HR, Sales, Marketing, Finance'
    }
  });

  const handleSubmit = async (data: CompanySetupFormData) => {
    setLoading(true);
    try {
      const departments = data.departments.split(',').map(d => d.trim()).filter(d => d);
      
      const companyData = {
        name: data.name,
        legalName: data.legalName,
        contact: {
          email: data.email,
          phone: data.phone,
          website: data.website,
          address: {
            street: data.street,
            city: data.city,
            state: data.state,
            country: data.country,
            zipCode: data.zipCode
          }
        },
        settings: {
          currency: data.currency,
          travelPolicy: {
            requireApproval: data.requireApproval,
            approvalLimits: [],
            allowedBookingWindow: data.allowedBookingWindow
          },
          budgetControls: {
            enabled: true,
            departmentBudgets: departments.map(dept => ({
              department: dept,
              annualBudget: 50000,
              spentAmount: 0,
              currency: data.currency
            }))
          }
        },
        subscription: {
          plan: 'basic',
          status: 'active'
        }
      };

      await corporateService.createCompany(companyData);
      
      navigate('/corporate/dashboard', {
        state: { message: 'Company setup completed successfully!' }
      });
    } catch (error: any) {
      console.error('Company setup failed:', error);
      alert(error.response?.data?.error?.message || 'Setup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <section className="bg-white py-6 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Corporate Account Setup</h1>
          <p className="text-primary-600">Set up your company account to start booking corporate travel</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-primary-900 mb-4">Company Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Company Name *</label>
                      <input
                        {...form.register('name')}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        placeholder="Acme Corporation"
                      />
                      {form.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Legal Name</label>
                      <input
                        {...form.register('legalName')}
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        placeholder="Acme Corporation Inc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Email *</label>
                      <input
                        {...form.register('email')}
                        type="email"
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        placeholder="admin@company.com"
                      />
                      {form.formState.errors.email && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-primary-900 mb-2">Phone</label>
                      <input
                        {...form.register('phone')}
                        type="tel"
                        className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Website</label>
                    <input
                      {...form.register('website')}
                      type="url"
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-primary-900 mb-4">Travel Policy</h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Currency</label>
                        <select
                          {...form.register('currency')}
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                          <option value="INR">INR - Indian Rupee</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-primary-900 mb-2">Booking Window (days)</label>
                        <input
                          {...form.register('allowedBookingWindow', { valueAsNumber: true })}
                          type="number"
                          min="1"
                          max="365"
                          className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent"
                        />
                        <p className="text-xs text-primary-600 mt-1">How many days in advance employees can book</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        {...form.register('requireApproval')}
                        type="checkbox"
                        className="accent-blue-ocean"
                      />
                      <label className="text-sm text-primary-700">
                        Require approval for all bookings
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-primary-900 mb-4">Departments</h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-primary-900 mb-2">Department Names *</label>
                    <textarea
                      {...form.register('departments')}
                      rows={3}
                      className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:ring-2 focus:ring-blue-ocean focus:border-transparent resize-none"
                      placeholder="IT, HR, Sales, Marketing, Finance"
                    />
                    <p className="text-xs text-primary-600 mt-1">Separate department names with commas</p>
                    {form.formState.errors.departments && (
                      <p className="text-red-500 text-sm mt-1">{form.formState.errors.departments.message}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" fullWidth size="lg" disabled={loading}>
                  {loading ? <LoadingSpinner size="sm" /> : 'Complete Setup'}
                </Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Corporate Benefits</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-emerald text-xl">💰</span>
                  <div>
                    <h4 className="font-semibold text-primary-900">Corporate Rates</h4>
                    <p className="text-sm text-primary-600">Get exclusive discounts on flights, hotels, and packages</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-blue-ocean text-xl">✅</span>
                  <div>
                    <h4 className="font-semibold text-primary-900">Approval Workflow</h4>
                    <p className="text-sm text-primary-600">Streamlined approval process for travel bookings</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-amber-premium text-xl">📊</span>
                  <div>
                    <h4 className="font-semibold text-primary-900">Expense Tracking</h4>
                    <p className="text-sm text-primary-600">Detailed reports and budget management tools</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-purple-500 text-xl">👥</span>
                  <div>
                    <h4 className="font-semibold text-primary-900">Team Management</h4>
                    <p className="text-sm text-primary-600">Manage employees and their travel permissions</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateSetupPage;