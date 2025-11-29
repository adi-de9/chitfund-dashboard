import apiClient from './apiClient';

export interface Notification {
  id: string;
  userId: string;
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
  message: string;
  status: 'SENT' | 'FAILED';
  sentAt: string;
}

export interface SendNotificationData {
  userIds: string[];
  type: 'EMAIL' | 'SMS' | 'WHATSAPP';
  message: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get<Notification[]>('/notifications');
  return response.data;
};

export const sendNotification = async (data: SendNotificationData): Promise<void> => {
  await apiClient.post('/notifications/send', data);
};
