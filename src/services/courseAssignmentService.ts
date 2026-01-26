import api from '../lib/api';

export const courseAssignmentService = {
  getAllAssignments: async (page: number = 1, limit: number = 10, searchTerm: string = '', deptId?: number, classroomId?: number) => {
    let url = `/course-assignments?page=${page}&limit=${limit}&search=${encodeURIComponent(searchTerm)}`;
    if (deptId) url += `&deptId=${deptId}`;
    if (classroomId) url += `&classroomId=${classroomId}`;
    const response = await api.get(url);
    return response.data;
  },

  importAssignments: async (file: File, term?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (term) formData.append('term', term);
    const response = await api.post('/course-assignments/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  createAssignment: async (data: any) => {
    const response = await api.post('/course-assignments', data);
    return response.data.data;
  },
  updateAssignment: async (id: number, data: any) => {
    const response = await api.put(`/course-assignments/${id}`, data);
    return response.data.data;
  },
  deleteAssignment: async (id: number) => {
    const response = await api.delete(`/course-assignments/${id}`);
    return response.data.data;
  }
};