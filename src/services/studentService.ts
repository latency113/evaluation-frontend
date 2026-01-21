import api from '../lib/api';

export const studentService = {
  getAllStudents: async (page: number = 1, limit: number = 10, search: string = "", classroomId?: number) => {
    let url = `/students?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
    if (classroomId) {
      url += `&classroomId=${classroomId}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  
  getStudentById: async (id: number) => {
    const response = await api.get(`/students/${id}`);
    return response.data.data;
  },

  createStudent: async (data: any) => {
    const response = await api.post('/students', data);
    return response.data.data;
  },

  updateStudent: async (id: number, data: any) => {
    const response = await api.put(`/students/${id}`, data);
    return response.data.data;
  },

  deleteStudent: async (id: number) => {
    const response = await api.delete(`/students/${id}`);
    return response.data.data;
  }
};