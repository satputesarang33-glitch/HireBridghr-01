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
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ['applications'] });
      const previousApps = queryClient.getQueryData(['applications']);

      queryClient.setQueriesData({ queryKey: ['applications'] }, (old) => {
        if (!old) return old;
        const apps = Array.isArray(old) ? old : (Array.isArray(old?.data) ? old.data : []);
        const updated = apps.map((app) => (app.id === id ? { ...app, stage, status: stage } : app));
        return Array.isArray(old) ? updated : { ...old, data: updated };
      });

      return { previousApps };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      const targetLabel = variables.stage === 'APPLIED' ? 'New Applicants' : variables.stage;
      toast.success('Stage Updated', `Candidate moved to ${targetLabel}.`);
    },
    onError: (err, variables, context) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['applications'], context.previousApps);
      }
      toast.error('Update Failed', err?.message || 'Could not update pipeline stage.');
    },
  });
}
