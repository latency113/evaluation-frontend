import api from '../lib/api';

export const evaluationService = {
  getCourseAssignmentsByClassroom: async (classroomId: number) => {
    const response = await api.get('/course-assignments?limit=100'); // ดึงมาเยอะหน่อยสำหรับหน้าประเมิน
    return response.data.data.filter((a: any) => a.classroom_id === classroomId);
  },

  getEvaluationQuestions: async () => {
    const response = await api.get('/evaluation-questions');
    return response.data.data;
  },

  submitEvaluation: async (data: {
    assignment_id: number;
    student_id: number;
    suggestion: string;
    answers: { question_id: number; score: number }[];
  }) => {
    const evalResponse = await api.post('/evaluations', {
      assignment_id: data.assignment_id,
      student_id: data.student_id,
      suggestion: data.suggestion
    });
    
    const evalId = evalResponse.data.data.id;

    const answerPromises = data.answers.map(answer => 
      api.post('/evaluation-answers', {
        eval_id: evalId,
        question_id: answer.question_id,
        score: answer.score
      })
    );

    await Promise.all(answerPromises);
    return evalResponse.data.data;
  },

  getEvaluationsByStudent: async (studentId: number) => {
    const response = await api.get('/evaluations?limit=100');
    return response.data.data.filter((e: any) => e.student_id === studentId);
  },

  getAllEvaluations: async (page: number = 1, limit: number = 10) => {
    const response = await api.get(`/evaluations?page=${page}&limit=${limit}`);
    return response.data;
  }
};