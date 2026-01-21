import api from '../lib/api';

export const subjectService = {
  getAllSubjects: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/subjects?page=${page}&limit=${limit}`);
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