import api from './api';

export const getPatientMedications = (patientId) => api.get(`/medications/patient/${patientId}`);
export const addMedication = (patientId, data) => api.post(`/medications/patient/${patientId}`, data);
export const updateMedication = (id, data) => api.put(`/medications/${id}`, data);
export const deleteMedication = (id) => api.delete(`/medications/${id}`);
export const searchReferenceMedications = (q) => api.get('/medications/search', { params: { q } });
