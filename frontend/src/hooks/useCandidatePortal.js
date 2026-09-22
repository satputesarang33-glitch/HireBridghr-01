import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidatePortalService } from '../services/candidatePortalService.js';

export const CANDIDATE_QUERY_KEYS = {
  PROFILE: ['candidate', 'profile'],
  SAVED_JOBS: ['candidate', 'savedJobs'],
  APPLICATIONS: ['candidate', 'applications'],
  NOTIFICATIONS: ['candidate', 'notifications'],
  JOBS: ['candidate', 'jobs'],
  JOB_DETAILS: (id) => ['candidate', 'job', id],
};

export function useCandidateProfile() {
  return useQuery({
    queryKey: CANDIDATE_QUERY_KEYS.PROFILE,
    queryFn: () => candidatePortalService.getProfile(),
  });
}

export function useUpdateCandidateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => candidatePortalService.updateProfile(data),
    onSuccess: (data) => {
      queryClient.setQueryData(CANDIDATE_QUERY_KEYS.PROFILE, data);
    },
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fileData) => candidatePortalService.uploadResume(fileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.PROFILE });
    },
  });
}

export function useCandidateSavedJobs() {
  return useQuery({
    queryKey: CANDIDATE_QUERY_KEYS.SAVED_JOBS,
    queryFn: () => candidatePortalService.getSavedJobs(),
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => candidatePortalService.saveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.SAVED_JOBS });
    },
  });
}

export function useRemoveSavedJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId) => candidatePortalService.removeSavedJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.SAVED_JOBS });
    },
  });
}

export function useCandidateApplications() {
  return useQuery({
    queryKey: CANDIDATE_QUERY_KEYS.APPLICATIONS,
    queryFn: () => candidatePortalService.getApplications(),
  });
}

export function useApplyJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, applicationData }) => candidatePortalService.applyToJob(jobId, applicationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.APPLICATIONS });
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.NOTIFICATIONS });
    },
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (appId) => candidatePortalService.withdrawApplication(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.APPLICATIONS });
    },
  });
}

export function useCandidateNotifications() {
  return useQuery({
    queryKey: CANDIDATE_QUERY_KEYS.NOTIFICATIONS,
    queryFn: () => candidatePortalService.getNotifications(),
    refetchInterval: 15000, // Poll every 15s to catch recruiter status changes
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => candidatePortalService.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.NOTIFICATIONS });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => candidatePortalService.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CANDIDATE_QUERY_KEYS.NOTIFICATIONS });
    },
  });
}

export function useCandidateJobs(params = {}) {
  return useQuery({
    queryKey: [...CANDIDATE_QUERY_KEYS.JOBS, params],
    queryFn: () => candidatePortalService.getJobs(params),
  });
}

export function useCandidateJobDetails(jobId) {
  return useQuery({
    queryKey: CANDIDATE_QUERY_KEYS.JOB_DETAILS(jobId),
    queryFn: () => candidatePortalService.getJobById(jobId),
    enabled: !!jobId,
  });
}
