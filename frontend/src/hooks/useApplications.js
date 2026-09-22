import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { applicationService } from '../services/applicationService.js';
import { useToast } from '../context/ToastContext.js';

export function useApplications(filters = {}) {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => applicationService.getApplications(filters),
  });
}

export function useUpdateApplicationStage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, stage }) => applicationService.updateStage(id, stage),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Stage Updated', `Candidate moved to ${variables.stage}.`);
    },
    onError: (err) => {
      toast.error('Update Failed', err?.message || 'Could not update pipeline stage.');
    },
  });
}
