import api from './api';

export const askPatientAI = (patientId, question) =>
  api.post(`/ai/patient/${patientId}/ask`, { question });
