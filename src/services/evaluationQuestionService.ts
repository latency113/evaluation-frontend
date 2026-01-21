import api from '../lib/api';

export const evaluationQuestionService = {
  getAllQuestions: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/evaluation-questions?page=${page}&limit=${limit}`);
    return response.data;
  },
  
  getQuestionById: async (id: number) => {
    const response = await api.get(`/evaluation-questions/${id}`);
    return response.data.data;
  },

  createQuestion: async (data: { question_text: string }) => {
    const response = await api.post('/evaluation-questions', data);
    return response.data.data;
  },

  updateQuestion: async (id: number, data: { question_text: string }) => {
    const response = await api.put(`/evaluation-questions/${id}`, data);
    return response.data.data;
  },

  deleteQuestion: async (id: number) => {
    const response = await api.delete(`/evaluation-questions/${id}`);
    return response.data.data;
  }
};
