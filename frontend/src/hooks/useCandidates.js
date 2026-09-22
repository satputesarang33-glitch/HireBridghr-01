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
