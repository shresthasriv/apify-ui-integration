import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
});

const getAuthHeaders = (token: string) => ({
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

export const getActors = (token: string) => {
  return apiClient.get('/actors', getAuthHeaders(token));
};

export const getActorSchema = (actorId: string, token: string) => {
  return apiClient.get(`/actors/${actorId}`, getAuthHeaders(token));
};

export const runActor = (actorId: string, input: any, token: string) => {
  return apiClient.post(`/actors/${actorId}/run`, input, getAuthHeaders(token));
};