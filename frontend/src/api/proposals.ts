import apiClient from './client';
import { Proposal, ProposalCreate } from '../types';

export const proposalsApi = {
  getMyProposals: async (): Promise<Proposal[]> => {
    const response = await apiClient.get('/proposals/');
    return response.data;
  },

  getJobProposals: async (jobId: number): Promise<Proposal[]> => {
    const response = await apiClient.get(`/proposals/${jobId}`);
    return response.data;
  },

  createProposal: async (jobId: number, proposal: ProposalCreate): Promise<Proposal> => {
    const response = await apiClient.post(`/proposals/${jobId}`, proposal);
    return response.data;
  },
};
