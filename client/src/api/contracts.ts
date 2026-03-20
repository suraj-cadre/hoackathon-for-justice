import type {
  ContractAnalyzeRequest,
  ContractAnalyzeResponse,
  ContractDetailResponse,
  ContractResponse,
  PaginatedFindings,
} from "../types/contracts";
import apiClient from "./client";

export const contractsApi = {
  analyze: (data: ContractAnalyzeRequest) =>
    apiClient.post<ContractAnalyzeResponse>("/api/v1/contracts/analyze", data),

  upload: (file: File, title: string, userEmail?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    if (userEmail) formData.append("user_email", userEmail);
    return apiClient.post<ContractAnalyzeResponse>(
      "/api/v1/contracts/upload",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  list: (skip = 0, limit = 20) =>
    apiClient.get<ContractResponse[]>("/api/v1/contracts", {
      params: { skip, limit },
    }),

  getResults: (contractId: number) =>
    apiClient.get<ContractDetailResponse>(
      `/api/v1/contracts/${contractId}/results`,
    ),

  getFindings: (
    contractId: number,
    params?: {
      issue_type?: string;
      severity?: string;
      page?: number;
      page_size?: number;
    },
  ) =>
    apiClient.get<PaginatedFindings>(
      `/api/v1/contracts/${contractId}/findings`,
      { params },
    ),

  emailReport: (contractId: number, email: string) =>
    apiClient.post(`/api/v1/contracts/${contractId}/email-report`, { email }),
};

export const healthApi = {
  live: () => apiClient.get("/health/live"),
  ready: () => apiClient.get("/health/ready"),
};
