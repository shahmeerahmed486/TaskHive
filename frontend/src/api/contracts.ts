import apiClient from './client';
import { Contract } from '../types';

export const contractsApi = {
  getMyContracts: async (): Promise<Contract[]> => {
    const response = await apiClient.get('/contracts/');
    return response.data;
  },

  acceptProposal: async (proposalId: number): Promise<Contract> => {
    const response = await apiClient.post(`/contracts/${proposalId}`);
    return response.data;
  },
};

export const getWebSocketUrl = (contractId: number, token: string): string => {
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  // Extract host from API URL (remove http:// or https://)
  const wsHost = apiUrl.replace(/^https?:\/\//, '');
  return `${wsProtocol}//${wsHost}/contracts/ws/${contractId}?token=${token}`;
};
