import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interviewService } from '../services/interviewService.js';
import { useToast } from '../context/ToastContext.js';

export function useInterviews(filters = {}) {
  return useQuery({
    queryKey: ['interviews', filters],
    queryFn: () => interviewService.getInterviews(filters),
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (data) => interviewService.scheduleInterview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Interview Scheduled', 'Calendar invite & link registered.');
    },
    onError: (err) => {
      toast.error('Scheduling Failed', err?.message || 'Unable to schedule interview.');
    },
  });
}

export function useSubmitInterviewFeedback() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, feedback }) => interviewService.submitFeedback(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
      toast.success('Feedback Submitted', 'Candidate scorecard saved.');
    },
  });
}
