import apiClient from './apiClient';

export interface Cycle {
  id: string;
  groupId: string;
  cycleNumber: number;
  month: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  winnerId?: string;
  winningBid?: number;
  dividendAmount?: number;
  payableAmount?: number;
  auctionDate?: string;
  dueDate?: string;
}

export const getGroupCycles = async (groupId: string): Promise<Cycle[]> => {
  const response = await apiClient.get<Cycle[]>(`/cycles/${groupId}`);
  return response.data;
};

export const getCycle = async (id: string): Promise<Cycle> => {
  const response = await apiClient.get<Cycle>(`/cycles/cycle/${id}`);
  return response.data;
};

export const createNextCycle = async (groupId: string): Promise<Cycle> => {
  const response = await apiClient.post<Cycle>(`/cycles/create/${groupId}`);
  return response.data;
};
