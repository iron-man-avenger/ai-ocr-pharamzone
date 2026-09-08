import axios from 'axios';
import { EvrenExtractionResponse } from '../types/evren';

const apiClient = axios.create({
  baseURL: '/api/evren',
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const evrenApi = {
  async extractContract(file: File): Promise<EvrenExtractionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<EvrenExtractionResponse>('/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
