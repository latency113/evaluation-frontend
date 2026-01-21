import api from '../lib/api';

export const classroomService = {
  getAllClassrooms: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/classrooms?page=${page}&limit=${limit}`);
    return response.data; // คืนค่าทั้งหมดที่มี data และ meta
  },
  getClassroomById: async (id: number) => {
    const response = await api.get(`/classrooms/${id}`);
    return response.data.data;
  },
  createClassroom: async (data: any) => {
    const response = await api.post('/classrooms', data);
    return response.data.data;
  },
  updateClassroom: async (id: number, data: any) => {
    const response = await api.put(`/classrooms/${id}`, data);
    return response.data.data;
  },
  deleteClassroom: async (id: number) => {
    const response = await api.delete(`/classrooms/${id}`);
    return response.data.data;
  },
  findByName: async (name: string) => {
    try {
      const response = await api.get(`/classrooms/search?name=${encodeURIComponent(name)}`);
      return response.data.data;
    } catch (err) {
      return null;
    }
  }
};