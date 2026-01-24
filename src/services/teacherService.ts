import api from '../lib/api';

export const teacherService = {
  getAllTeachers: async (page: number = 1, limit: number = 10, searchTerm: string = '') => {
    const response = await api.get(`/teachers?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },
  
  importTeachers: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/teachers/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  getTeacherById: async (id: number) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data.data;
  },

  createTeacher: async (data: any) => {
    const response = await api.post('/teachers', data);
    return response.data.data;
  },

  updateTeacher: async (id: number, data: any) => {
    const response = await api.put(`/teachers/${id}`, data);
    return response.data.data;
  },

  deleteTeacher: async (id: number) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data.data;
  },
  
  findByName: async (firstName: string, lastName: string) => {
    try {
      const response = await api.get(`/teachers/search?firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`);
      return response.data.data;
    } catch (err) {
      return null;
    }
  }
};