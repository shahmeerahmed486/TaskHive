import apiClient from './client';
import { Job, JobCreate, JobUpdate, JobFilters } from '../types';

export const jobsApi = {
  getJobs: async (filters?: JobFilters): Promise<Job[]> => {
    const params = new URLSearchParams();
    if (filters?.skip) params.append('skip', filters.skip.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.title) params.append('title', filters.title);
    if (filters?.min_budget) params.append('min_budget', filters.min_budget.toString());
    if (filters?.max_budget) params.append('max_budget', filters.max_budget.toString());
    if (filters?.status) params.append('status', filters.status);

    const response = await apiClient.get('/jobs/', { params });
    return response.data;
  },

  createJob: async (job: JobCreate): Promise<Job> => {
    const response = await apiClient.post('/jobs/create', job);
    return response.data;
  },

  updateJob: async (jobId: number, job: JobUpdate): Promise<Job> => {
    const response = await apiClient.patch(`/jobs/${jobId}`, job);
    return response.data;
  },

  deleteJob: async (jobId: number): Promise<void> => {
    await apiClient.delete(`/jobs/${jobId}`);
  },
};
