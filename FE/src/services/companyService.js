import apiClient from './api';

// Company Services
export const companyService = {
  // Get list of companies
  getCompanies: async (searchQuery = null, options = {}) => {
    let url = '/company';
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.append('q', searchQuery);
    }
    
    if (options.topRated) {
      params.append('top_rated', 'true');
    }
    
    if (options.excludeIds && options.excludeIds.length > 0) {
      params.append('exclude_ids', options.excludeIds.join(','));
    }
    
    if (options.limit) {
      params.append('limit', options.limit);
    }
    
    if (options.page) {
      params.append('page', options.page);
    }
    
    if (options.perPage) {
      params.append('per_page', options.perPage);
    }
    
    if (options.filterBy) {
      params.append('filter_by', options.filterBy);
    }
    
    if (options.sortBy) {
      params.append('sort_by', options.sortBy);
    }
    
    if (options.sortOrder) {
      params.append('sort_order', options.sortOrder);
    }
    
    if (options.location) {
      params.append('location', options.location);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    return await apiClient.get(url);
  },
  
  // Get top rated companies
  getTopRatedCompanies: async (limit = 10) => {
    return await apiClient.get(`/company?top_rated=true`);
  },
  
  // Get remaining companies (excluding top rated)
  getRemainingCompanies: async (excludeIds, options = {}) => {
    const params = new URLSearchParams();
    params.append('exclude_ids', excludeIds.join(','));
    
    if (options.limit) {
      params.append('limit', options.limit);
    }
    
    return await apiClient.get(`/company?${params.toString()}`);
  },

  // Search companies by name
  searchCompanies: async (query) => {
    return await apiClient.get(`/company?q=${encodeURIComponent(query)}`);
  },

  // Get company details
  getCompanyOverview: async (companyId) => {
    return await apiClient.get(`/company/${companyId}/company_overview`);
  },

  // Create company (Admin/Owner only)
  createCompany: async (companyData) => {
    return await apiClient.post('/company', { company: companyData });
  },

  // Update company (Admin/Owner only)
  updateCompany: async (companyId, companyData) => {
    return await apiClient.put(`/company/${companyId}`, { company: companyData });
  },

  // Delete company (Soft delete - Admin/Owner only)
  deleteCompany: async (companyId) => {
    return await apiClient.put(`/company/${companyId}/delete_company`);
  },
};

