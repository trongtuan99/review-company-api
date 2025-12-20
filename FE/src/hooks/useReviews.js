import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';

export const useReviews = (companyId, page = 1, enabled = true) => {
  return useQuery({
    queryKey: ['reviews', companyId, page],
    queryFn: () => reviewService.getReviews(companyId, page),
    enabled: enabled && !!companyId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
};

