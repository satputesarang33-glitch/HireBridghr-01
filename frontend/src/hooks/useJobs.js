import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '../services/jobService.js';
import { useToast } from '../context/ToastContext.js';

export function useJobs(filters = {}) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobService.getJobs(filters),
  });
}

export function useJob(id) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getJobById(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (newJob) => jobService.createJob(newJob),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job Created', 'New job has been saved.');
    },
    onError: (error) => {
      toast.error('Creation Failed', error?.message || 'Unable to save job.');
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, data }) => jobService.updateJob(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
      toast.success('Job Updated', 'Changes saved successfully.');
    },
    onError: (error) => {
      toast.error('Update Failed', error?.message || 'Unable to update job.');
    },
  });
}

export function useRequestPublication() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id) => jobService.requestPublication(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      toast.success('Publication Requested', 'Job is now submitted to the Admin Publication Queue.');
    },
    onError: (error) => {
      toast.error('Request Failed', error?.message || 'Could not submit publication request.');
    },
  });
}
