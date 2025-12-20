import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

export const useReviewMutationsExtended = (companyId) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createMutation = useMutation({
    mutationFn: ({ companyId, reviewData }) => 
      reviewService.createReview(companyId, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', companyId] });
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-activity-stats'] });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ reviewId, reviewData }) => 
      reviewService.updateReview(reviewId, reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', companyId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId) => reviewService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', companyId] });
      queryClient.invalidateQueries({ queryKey: ['company', companyId] });
    },
  });

  return {
    createReview: createMutation.mutate,
    updateReview: updateMutation.mutate,
    deleteReview: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createReviewAsync: createMutation.mutateAsync,
    updateReviewAsync: updateMutation.mutateAsync,
    deleteReviewAsync: deleteMutation.mutateAsync,
  };
};

