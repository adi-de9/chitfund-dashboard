import apiClient from './apiClient';

export interface Group {
  id: string;
  name: string;
  chitValue: number;
  installmentAmount: number;
  totalMembers: number;
  durationMonths: number;
  startDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'PENDING';
}

export interface CreateGroupData {
  name: string;
  chitValue: number;
  totalMembers: number;
  durationMonths: number;
  startDate: string;
}

// Helper to map API response to frontend interface
const mapGroupFromApi = (data: any): Group => ({
  id: data.id,
  name: data.group_name,
  chitValue: Number(data.chit_value),
  installmentAmount: Number(data.monthly_contribution),
  totalMembers: data.total_members,
  durationMonths: data.total_members, // Assuming duration = members for now
  startDate: data.start_date,
  status: data.status ? data.status.toUpperCase() as Group['status'] : 'PENDING',
});

// Helper to map frontend data to API payload
const mapGroupToApi = (data: Partial<CreateGroupData>) => ({
  group_name: data.name,
  group_code: data.name ? data.name.toUpperCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000) : undefined,
  chit_value: data.chitValue,
  total_members: data.totalMembers,
  monthly_contribution: data.chitValue && data.totalMembers ? data.chitValue / data.totalMembers : 0,
  start_date: data.startDate,
});

export const getGroups = async (): Promise<Group[]> => {
  const response = await apiClient.get<any[]>('/groups');
  return response.data.map(mapGroupFromApi);
};

export const getGroup = async (id: string): Promise<Group> => {
  const response = await apiClient.get<any>(`/groups/${id}`);
  return mapGroupFromApi(response.data);
};

export const createGroup = async (data: CreateGroupData): Promise<Group> => {
  const payload = {
    ...mapGroupToApi(data),
    monthly_contribution: data.chitValue / data.totalMembers,
  };
  const response = await apiClient.post<any>('/groups', payload);
  return mapGroupFromApi(response.data);
};

export const updateGroup = async (id: string, data: Partial<CreateGroupData>): Promise<Group> => {
  const payload = mapGroupToApi(data);
  const response = await apiClient.patch<any>(`/groups/${id}`, payload);
  return mapGroupFromApi(response.data);
};

export const updateGroupStatus = async (id: string, status: Group['status']): Promise<Group> => {
  const response = await apiClient.patch<any>(`/groups/${id}/status`, { status: status.toLowerCase() });
  return mapGroupFromApi(response.data);
};

export const deleteGroup = async (id: string): Promise<void> => {
  await updateGroupStatus(id, 'CLOSED');
};
