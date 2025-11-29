import apiClient from './apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF' | 'MEMBER';
  status: 'ACTIVE' | 'INACTIVE';
  phone?: string;
  createdAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string; // Optional if auto-generated or handled otherwise
  role: User['role'];
  phone?: string;
}

export const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

export const getUser = async (id: string): Promise<User> => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: CreateUserData): Promise<User> => {
  const response = await apiClient.post<User>('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: Partial<CreateUserData>): Promise<User> => {
  const response = await apiClient.patch<User>(`/users/${id}`, data);
  return response.data;
};

export const updateUserStatus = async (id: string, status: User['status']): Promise<User> => {
  const response = await apiClient.patch<User>(`/users/${id}/status`, { status });
  return response.data;
};
