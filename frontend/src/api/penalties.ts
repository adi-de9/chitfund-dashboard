import apiClient from './apiClient';

export interface Penalty {
  id: string;
  cycleId: string;
  memberId: string;
  memberName: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'PAID' | 'WAIVED';
}

export interface PenaltyRule {
  groupId: string;
  penaltyType: 'FIXED' | 'DAILY' | 'PERCENTAGE';
  amount: number;
  gracePeriodDays: number;
}

export const getCyclePenalties = async (cycleId: string): Promise<Penalty[]> => {
  const response = await apiClient.get<Penalty[]>(`/cycles/${cycleId}/penalties`);
  return response.data;
};

export const getPenaltyRules = async (groupId: string): Promise<PenaltyRule> => {
  const response = await apiClient.get<PenaltyRule>(`/groups/${groupId}/settings/penalties`);
  return response.data;
};

export const updatePenaltyRules = async (groupId: string, data: PenaltyRule): Promise<PenaltyRule> => {
  const response = await apiClient.put<PenaltyRule>(`/groups/${groupId}/settings/penalties`, data);
  return response.data;
};
