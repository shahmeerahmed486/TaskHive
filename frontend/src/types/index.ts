export interface User {
  id: number;
  email: string;
  role: 'client' | 'freelancer';
  name: string;
  is_active: boolean;
}

export interface Job {
  id: number;
  title: string;
  description: string | null;
  budget: number;
  status: string;
  client_id: number;
}

export interface Proposal {
  id: number;
  bid_amount: number;
  cover_letter: string | null;
  job_id: number;
  freelancer_id: number;
}

export interface Contract {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  job_id: number;
  freelancer_id: number;
  client_id: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: 'client' | 'freelancer';
  name: string;
}

export interface JobCreate {
  title: string;
  description: string;
  budget: number;
  status?: string;
}

export interface JobUpdate {
  title?: string;
  description?: string;
  budget?: number;
  status?: string;
}

export interface ProposalCreate {
  bid_amount: number;
  cover_letter?: string;
}

export interface WebSocketMessage {
  type: 'contract_created' | 'user_joined' | 'chat' | 'user_left';
  contract_id?: number;
  job_id?: number;
  client_id?: number;
  freelancer_id?: number;
  status?: string;
  user_id?: number;
  from?: number;
  message?: string;
  error?: string;
}

export interface JobFilters {
  skip?: number;
  limit?: number;
  title?: string;
  min_budget?: number;
  max_budget?: number;
  status?: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}