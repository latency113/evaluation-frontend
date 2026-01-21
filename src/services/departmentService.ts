import api from '../lib/api';

export const departmentService = {
  getAllDepartments: async () => {
    const response = await api.get('/departments');
    return response.data.data;
  },
  createDepartment: async (data: any) => {
    const response = await api.post('/departments', data);
    return response.data.data;
  },
  findByName: async (name: string) => {
    try {
      const response = await api.get(`/departments/search?name=${encodeURIComponent(name)}`);
      return response.data.data;
    } catch (err) {
      return null;
    }
  }
};
