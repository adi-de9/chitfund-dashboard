import apiClient from './apiClient';

export interface Document {
  id: string;
  userId: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export const getUserDocuments = async (userId: string): Promise<Document[]> => {
  const response = await apiClient.get<Document[]>(`/users/${userId}/documents`);
  return response.data;
};

export const uploadDocument = async (userId: string, file: File): Promise<Document> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post<Document>(`/users/${userId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await apiClient.delete(`/documents/${documentId}`);
};
