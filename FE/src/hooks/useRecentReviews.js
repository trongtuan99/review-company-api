import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';

export const useRecentReviews = (limit = 10, enabled = true) => {
  return useQuery({
    queryKey: ['recent-reviews', limit],
    queryFn: () => reviewService.getRecentReviews(limit),
    enabled: enabled,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
};

