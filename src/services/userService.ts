import api from '../lib/api';

export const userService = {
  login: async (data: any) => {
    // Since we don't have a specific login endpoint that returns JWT yet,
    // we'll simulate it by checking against the users list for now
    // or we can implement a simple login in the backend
    const response = await api.get('/users');
    const users = response.data.data;
    const user = users.find((u: any) => u.username === data.username);
    
    // In a real app, the backend would verify the password and return a JWT
    // For this prototype, we'll assume the password check is done or simplified
    if (user && user.role === 'admin') {
      return user;
    }
    throw new Error('Invalid credentials');
  },

  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data.data;
  }
};
