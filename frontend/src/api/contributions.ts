import apiClient from './apiClient';

export interface Contribution {
  id: string;
  cycleId: string;
  memberId: string;
  memberName: string;
  amountPayable: number;
  amountPaid: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  paidDate?: string;
  paymentMode?: string;
  transactionId?: string;
}

export interface PaymentData {
  amount: number;
  paymentMode: string;
  transactionId?: string;
  notes?: string;
}

export const getCycleContributions = async (cycleId: string): Promise<Contribution[]> => {
  const response = await apiClient.get<Contribution[]>(`/cycles/${cycleId}/contributions`);
  return response.data;
};

export const recordPayment = async (contributionId: string, data: PaymentData): Promise<Contribution> => {
  const response = await apiClient.post<Contribution>(`/contributions/${contributionId}/pay`, data);
  return response.data;
};

export const getSubPayments = async (contributionId: string): Promise<any[]> => {
  const response = await apiClient.get<any[]>(`/contributions/${contributionId}/payments`);
  return response.data;
};
