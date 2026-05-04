import api from '../lib/api';

const leadService = {
  getLeads: async (params) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  getLeadById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  createLead: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  updateLead: async (id, leadData) => {
    const response = await api.patch(`/leads/${id}`, leadData);
    return response.data;
  },

  deleteLead: async (id) => {
    const response = await api.delete(`/leads/${id}`);
    return response.data;
  },

  bulkAssign: async (data) => {
    const response = await api.post('/leads/bulk-assign', data);
    return response.data;
  },

  importLeads: async (formData) => {
    const response = await api.post('/leads/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default leadService;
