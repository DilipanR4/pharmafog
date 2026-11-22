import api from './api';

export const runAssessment = (patientId) => api.post(`/assessments/patient/${patientId}`);
export const getPatientAssessments = (patientId) => api.get(`/assessments/patient/${patientId}`);
export const getAssessmentById = (id) => api.get(`/assessments/${id}`);
export const getDashboardStats = () => api.get('/assessments/dashboard/stats');
export const updateChecklistItem = (assessmentId, itemId, completed) =>
  api.patch(`/assessments/${assessmentId}/checklist/${itemId}`, { completed });
export const checkDirectInteractions = (medications) => api.post('/reference/check', { medications });
export const getReferenceMedications = (params) => api.get('/reference/medications', { params });
export const getReferenceInteractions = (params) => api.get('/reference/interactions', { params });
