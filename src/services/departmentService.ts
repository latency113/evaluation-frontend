import api from '../lib/api';

export const departmentService = {
  getAllDepartments: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/departments?page=${page}&limit=${limit}`);
    return response.data;
  },
  getAllDepartmentsWithoutPagination: async () => {
    const response = await api.get('/departments/all');
    return response.data.data;
  },
  createDepartment: async (data: any) => {
    const response = await api.post('/departments', data);
    return response.data.data;
  },
  updateDepartment: async (id: number, data: any) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data.data;
  },
  deleteDepartment: async (id: number) => {
    const response = await api.delete(`/departments/${id}`);
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
