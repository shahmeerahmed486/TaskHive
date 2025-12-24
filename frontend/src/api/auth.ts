import apiClient from './client';
import { LoginCredentials, RegisterData, User, Token } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  register: async (data: RegisterData): Promise<User> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/auth/users');
    return response.data;
  },

  getUser: async (userId: number): Promise<User> => {
    const response = await apiClient.get(`/auth/users/${userId}`);
    return response.data;
  },
};
