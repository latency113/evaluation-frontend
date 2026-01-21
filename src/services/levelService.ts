import api from '../lib/api';

export const levelService = {
  getAllLevels: async () => {
    const response = await api.get('/levels');
    return response.data.data;
  },
  createLevel: async (data: any) => {
    const response = await api.post('/levels', data);
    return response.data.data;
  },
  findByName: async (name: string) => {
    try {
      const response = await api.get(`/levels/search?name=${encodeURIComponent(name)}`);
      return response.data.data;
    } catch (err) {
      return null;
    }
  }
};
