import api from '../lib/api';

export const userService = {
  login: async (data: any) => {
    // Since we don't have a specific login endpoint that returns JWT yet,
    // we'll simulate it by checking against the users list for now
    // or we can implement a simple login in the backend
    const response = await api.get('/users');
    const users = response.data.data;
    const user = users.find((u: any) => u.username === data.username);
    
    if (user && (user.role === 'admin' || user.role === 'teacher')) {
      return user;
    }
    throw new Error('Invalid credentials');
  },

  getAllUsers: async (page: number = 1, limit: number = 10, search: string = '') => {
    const response = await api.get(`/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
    return response.data;
  },

  createUser: async (data: any) => {
    const response = await api.post('/users', data);
    return response.data.data;
  },

  updateUser: async (id: number, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data.data;
  }
};
