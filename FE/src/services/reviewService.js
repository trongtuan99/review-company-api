import apiClient from './api';

// Review Services
export const reviewService = {
  // Get reviews for a company with pagination and filters
  getReviews: async (companyId, page = 1, perPage = 10, filters = {}) => {
    let url = `/review?company_id=${companyId}&page=${page}&per_page=${perPage}`;

    // Add filter parameters if provided
    if (filters.minScore) {
      url += `&min_score=${filters.minScore}`;
    }
    if (filters.maxScore) {
      url += `&max_score=${filters.maxScore}`;
    }
    if (filters.sortBy) {
      url += `&sort_by=${filters.sortBy}`;
    }
    if (filters.sortOrder) {
      url += `&sort_order=${filters.sortOrder}`;
    }

    return await apiClient.get(url);
  },

  // Create review
  createReview: async (companyId, reviewData) => {
    return await apiClient.post(`/review?company_id=${companyId}`, {
      review: reviewData
    });
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    return await apiClient.put(`/review/${reviewId}`, {
      review: reviewData
    });
  },

  // Delete review (Soft delete)
  deleteReview: async (reviewId) => {
    return await apiClient.put(`/review/${reviewId}/delete_review`);
  },

  // Like review
  likeReview: async (reviewId) => {
    return await apiClient.put(`/review/${reviewId}/like`);
  },

  // Dislike review
  dislikeReview: async (reviewId) => {
    return await apiClient.put(`/review/${reviewId}/dislike`);
  },

  // Get recent reviews (all companies)
  getRecentReviews: async (limit = 10) => {
    return await apiClient.get(`/review/recent?limit=${limit}`);
  },

  // Get single review by ID
  getReviewById: async (reviewId) => {
    return await apiClient.get(`/review/${reviewId}`);
  },

  // Get all reviews with pagination (for admin)
  getAllReviews: async (page = 1, perPage = 10, filters = {}) => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('per_page', perPage);

    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    if (filters.search) {
      params.append('q', filters.search);
    }
    if (filters.sortBy) {
      params.append('sort_by', filters.sortBy);
    }
    if (filters.sortOrder) {
      params.append('sort_order', filters.sortOrder);
    }

    return await apiClient.get(`/review/all?${params.toString()}`);
  },
};

