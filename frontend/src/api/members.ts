import apiClient from './apiClient';

export interface Member {
  id: string;
  group_id: string;
  user_id: string;
  join_date: string;
  nominee_name?: string;
  nominee_phone?: string;
  won_status: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    status: 'ACTIVE' | 'INACTIVE';
  };
}

export interface AddMemberData {
  groupId: string;
  name: string;
  phone: string;
  email?: string;
  nomineeName?: string;
  nomineePhone?: string;
}

export const getGroupMembers = async (groupId: string): Promise<Member[]> => {
  const response = await apiClient.get<Member[]>(
    `/group-members/${groupId}`
  );
  return response.data;
};

export const addMember = async (data: AddMemberData): Promise<Member> => {
  const response = await apiClient.post<Member>('/group-members', data);
  return response.data;
};

export const updateMember = async (id: string, data: Partial<AddMemberData>): Promise<Member> => {
  const response = await apiClient.patch<Member>(`/group-members/${id}`, data);
  return response.data;
};

export const deleteMember = async (id: string): Promise<void> => {
  await apiClient.delete(`/group-members/${id}`);
};
