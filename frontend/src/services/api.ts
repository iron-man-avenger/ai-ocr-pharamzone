import axios from 'axios';
import { 
  ExtractedAgreement, 
  InvoiceDraftRequest, 
  InvoiceDraftResponse, 
  HealthStatus, 
  SampleAgreementItem,
  ForexRatesResponse
} from '../types/invoice';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  async checkHealth(): Promise<HealthStatus> {
    const response = await apiClient.get<HealthStatus>('/health');
    return response.data;
  },

  async extractAgreement(file: File): Promise<ExtractedAgreement> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ExtractedAgreement>('/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async generateDraftInvoice(request: InvoiceDraftRequest): Promise<InvoiceDraftResponse> {
    const response = await apiClient.post<InvoiceDraftResponse>('/generate-draft', request);
    return response.data;
  },

  async getSampleAgreements(): Promise<SampleAgreementItem[]> {
    const response = await apiClient.get<SampleAgreementItem[]>('/sample-agreements');
    return response.data;
  },

  async getInvoices(): Promise<InvoiceDraftResponse[]> {
    const response = await apiClient.get<InvoiceDraftResponse[]>('/invoices');
    return response.data;
  },

  async getForexRates(): Promise<ForexRatesResponse> {
    const response = await apiClient.get<ForexRatesResponse>('/forex-rates');
    return response.data;
  },
};
