import apiClient from './client';
import type {
  ContractAnalyzeRequest,
  ContractAnalyzeResponse,
  ContractResponse,
  ContractDetailResponse,
  PaginatedFindings,
} from '../types/contracts';

export const contractsApi = {
  analyze: (data: ContractAnalyzeRequest) =>
    apiClient.post<ContractAnalyzeResponse>('/api/v1/contracts/analyze', data),

  list: (skip = 0, limit = 20) =>
    apiClient.get<ContractResponse[]>('/api/v1/contracts', {
      params: { skip, limit },
    }),

  getResults: (contractId: number) =>
    apiClient.get<ContractDetailResponse>(
      `/api/v1/contracts/${contractId}/results`,
    ),

  getFindings: (
    contractId: number,
    params?: { issue_type?: string; severity?: string; page?: number; page_size?: number },
  ) =>
    apiClient.get<PaginatedFindings>(
      `/api/v1/contracts/${contractId}/findings`,
      { params },
    ),

  emailReport: (contractId: number, email: string) =>
    apiClient.post(`/api/v1/contracts/${contractId}/email-report`, { email }),
};

export const healthApi = {
  live: () => apiClient.get('/health/live'),
  ready: () => apiClient.get('/health/ready'),
};
