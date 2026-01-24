import api from '../lib/api';

export const subjectService = {
  getAllSubjects: async (page: number = 1, limit: number = 10, searchTerm: string = '') => {
    const response = await api.get(`/subjects?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },
  
  importSubjects: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/subjects/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  createSubject: async (data: any) => {
    const response = await api.post('/subjects', data);
    return response.data.data;
  },
  updateSubject: async (id: number, data: any) => {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data.data;
  },
  deleteSubject: async (id: number) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data.data;
  }
};