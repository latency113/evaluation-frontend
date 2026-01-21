import api from '../lib/api';

export const courseAssignmentService = {
  getAllAssignments: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/course-assignments?page=${page}&limit=${limit}`);
    return response.data;
  },
  createAssignment: async (data: any) => {
    const response = await api.post('/course-assignments', data);
    return response.data.data;
  },
  updateAssignment: async (id: number, data: any) => {
    const response = await api.put(`/course-assignments/${id}`, data);
    return response.data.data;
  },
  deleteAssignment: async (id: number) => {
    const response = await api.delete(`/course-assignments/${id}`);
    return response.data.data;
  }
};