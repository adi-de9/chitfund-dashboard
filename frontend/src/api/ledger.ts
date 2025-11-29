import apiClient from './apiClient';

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  balance: number;
  groupId?: string;
  memberId?: string;
}

export const getLedger = async (groupId?: string): Promise<LedgerEntry[]> => {
  const params = groupId ? { groupId } : {};
  const response = await apiClient.get<LedgerEntry[]>('/ledger', { params });
  return response.data;
};

export const exportLedger = async (groupId?: string, format: 'pdf' | 'excel' = 'pdf'): Promise<Blob> => {
  const params = groupId ? { groupId, format } : { format };
  const response = await apiClient.get('/ledger/export', { 
    params,
    responseType: 'blob'
  });
  return response.data;
};
