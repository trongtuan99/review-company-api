import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';

export const useReviewMutations = (reviewId, companyId, onSuccessCallback) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const likeMutation = useMutation({
    mutationFn: () => reviewService.likeReview(reviewId),
    onSuccess: (response) => {
      let reviewData = null;
      if (response?.status === 'ok' || response?.status === 'success') {
        if (response.data) {
          if (response.data.review) {
            reviewData = response.data.review;
          } else if (response.data.id) {
            reviewData = response.data;
          }
          
          // Update callback first to ensure state is synced
          if (onSuccessCallback && reviewData) {
            onSuccessCallback(reviewId, reviewData);
          }
        }
      }
      
      // Delay invalidate to allow callback to update state first
      setTimeout(() => {
        if (companyId) {
          queryClient.invalidateQueries({ queryKey: ['reviews', companyId] });
        }
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: ['user-activity-stats'] });
        }
      }, 100);
    },
    onError: (err) => {
      // Error handling - could revert optimistic update here
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: () => reviewService.dislikeReview(reviewId),
    onSuccess: (response) => {
      let reviewData = null;
      if (response?.status === 'ok' || response?.status === 'success') {
        if (response.data) {
          if (response.data.review) {
            reviewData = response.data.review;
          } else if (response.data.id) {
            reviewData = response.data;
          }
          
          // Update callback first to ensure state is synced
          if (onSuccessCallback && reviewData) {
            onSuccessCallback(reviewId, reviewData);
          }
        }
      }
      
      // Delay invalidate to allow callback to update state first
      setTimeout(() => {
        if (companyId) {
          queryClient.invalidateQueries({ queryKey: ['reviews', companyId] });
        }
        if (user?.id) {
          queryClient.invalidateQueries({ queryKey: ['user-activity-stats'] });
        }
      }, 100);
    },
    onError: (err) => {
      // Error handling - could revert optimistic update here
    },
  });

  return {
    likeMutation,
    dislikeMutation,
    likeReview: likeMutation.mutate,
    dislikeReview: dislikeMutation.mutate,
    isLiking: likeMutation.isPending,
    isDisliking: dislikeMutation.isPending,
  };
};
