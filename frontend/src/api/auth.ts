import apiClient from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const register = async (data: any): Promise<void> => {
  await apiClient.post('/auth/register', data);
};

export const refreshToken = async (): Promise<void> => {
  await apiClient.post('/auth/refresh');
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
