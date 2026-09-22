import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { candidateService } from '../services/candidateService.js';
import { useToast } from '../context/ToastContext.js';

export function useCandidates(filters = {}) {
  return useQuery({
    queryKey: ['candidates', filters],
    queryFn: () => candidateService.getCandidates(filters),
  });
}

export function useCandidate(id) {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidateService.getCandidateById(id),
    enabled: !!id,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (candData) => candidateService.createCandidate(candData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate Added', 'Candidate profile saved to talent database.');
    },
    onError: (err) => {
      toast.error('Error', err?.message || 'Failed to add candidate.');
    },
  });
}

export function useAddCandidateNote() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ candidateId, note }) => candidateService.addNote(candidateId, note),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.candidateId] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Note Added', 'Internal recruiter note saved to timeline.');
    },
  });
}

export function useAssignRecruiter() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ candidateId, recruiter }) => candidateService.assignRecruiter(candidateId, recruiter),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.candidateId] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Recruiter Assigned', `Assigned to ${variables.recruiter.name}.`);
    },
  });
}

export function useUpdateCandidate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, candidateData }) => candidateService.updateCandidate(id, candidateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate Updated', 'Profile changes saved successfully.');
    },
    onError: (err) => {
      toast.error('Error', err?.message || 'Failed to update candidate profile.');
    },
  });
}

export function useDeleteCandidate() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id) => candidateService.deleteCandidate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Candidate Deleted', 'Candidate profile removed.');
    },
    onError: (err) => {
      toast.error('Error', err?.message || 'Failed to delete candidate.');
    },
  });
}

export function useUpdateCandidateRating() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ candidateId, rating }) => candidateService.updateRating(candidateId, rating),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.candidateId] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Rating Updated', `Candidate score set to ${variables.rating}/5.`);
    },
    onError: (err) => {
      toast.error('Error', err?.message || 'Failed to update rating.');
    },
  });
}

export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ candidateId, status }) => candidateService.updateStatus(candidateId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.candidateId] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Status Updated', `Candidate moved to ${variables.status}.`);
    },
    onError: (err) => {
      toast.error('Error', err?.message || 'Failed to update candidate status.');
    },
  });
}

/**
 * Unified "Do-It-All" React Query Mutation Hook.
 * Atomically handles rating, evaluation note, stage transition, recruiter ownership, and skill tags.
 */
export function useSaveCandidateEvaluation() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ candidateId, evaluationData }) =>
      candidateService.saveCandidateEvaluation(candidateId, evaluationData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.candidateId] });
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Evaluation Saved', 'Candidate score, notes, and lifecycle timeline updated.');
    },
    onError: (err) => {
      toast.error('Error', err?.message || 'Failed to record candidate evaluation.');
    },
  });
}

export function useBulkUpdateCandidates() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ candidateIds, updates }) =>
      candidateService.bulkUpdateCandidates(candidateIds, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      variables.candidateIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: ['candidate', id] });
      });
      toast.success('Bulk Update Applied', `Updated ${variables.candidateIds.length} candidate profiles.`);
    },
    onError: (err) => {
      toast.error('Error', err?.message || 'Failed to apply bulk candidate updates.');
    },
  });
}

