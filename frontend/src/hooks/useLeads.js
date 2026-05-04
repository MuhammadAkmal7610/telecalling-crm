import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import leadService from '../services/leadService';
import toast from 'react-hot-toast';

export const useLeads = (params) => {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadService.getLeads(params),
    keepPreviousData: true,
  });
};

export const useLead = (id) => {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadService.getLeadById(id),
    enabled: !!id,
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadService.createLead,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create lead');
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => leadService.updateLead(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['leads']);
      queryClient.invalidateQueries(['lead', variables.id]);
      toast.success('Lead updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update lead');
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leadService.deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries(['leads']);
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete lead');
    },
  });
};
