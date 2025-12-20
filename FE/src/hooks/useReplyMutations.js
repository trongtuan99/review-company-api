import { useMutation, useQueryClient } from '@tanstack/react-query';
import { replyService } from '../services/replyService';
import { useAuth } from '../contexts/AuthContext';

export const useReplyMutations = (reviewId) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createMutation = useMutation({
    mutationFn: (content) => replyService.createReply(reviewId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies', reviewId] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-activity-stats'] });
        queryClient.invalidateQueries({ queryKey: ['user-recent-comments'] });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ replyId, content }) => replyService.updateReply(replyId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies'] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-recent-comments'] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (replyId) => replyService.deleteReply(replyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['replies'] });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: ['user-activity-stats'] });
        queryClient.invalidateQueries({ queryKey: ['user-recent-comments'] });
      }
    },
  });

  return {
    createReply: createMutation.mutate,
    updateReply: updateMutation.mutate,
    deleteReply: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createReplyAsync: createMutation.mutateAsync,
    updateReplyAsync: updateMutation.mutateAsync,
    deleteReplyAsync: deleteMutation.mutateAsync,
  };
};

