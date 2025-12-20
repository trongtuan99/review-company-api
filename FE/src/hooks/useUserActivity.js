import { useQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';

export const useUserActivityStats = (enabled = true) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['user-activity-stats'],
    queryFn: () => userService.getActivityStats(),
    enabled: enabled && isAuthenticated,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useUserRecentComments = (limit = 10, enabled = true) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['user-recent-comments', limit],
    queryFn: () => userService.getRecentComments(limit),
    enabled: enabled && isAuthenticated,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
};

