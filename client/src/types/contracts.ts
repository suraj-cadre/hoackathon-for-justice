export type ContractStatus = "uploaded" | "analyzing" | "analyzed" | "failed";

export type IssueType =
  | "ambiguous_language"
  | "vague_timeframe"
  | "undefined_term"
  | "missing_quantity"
  | "unclear_obligation"
  | "missing_clause"
  | "other";

export type Severity = "low" | "medium" | "high";

export interface ContractAnalyzeRequest {
  title: string;
  contract_text: string;
  user_email?: string;
}

export interface ContractAnalyzeResponse {
  id: number;
  status: ContractStatus;
  message: string;
}

export interface ContractResponse {
  id: number;
  title: string;
  file_name: string | null;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

export interface DisputeFinding {
  id: number;
  clause_text: string;
  issue_type: IssueType;
  severity: Severity;
  explanation: string;
  suggested_revision: string | null;
  clause_start: number | null;
  clause_end: number | null;
}

export interface AnalysisResult {
  id: number;
  contract_id: number;
  model_used: string;
  summary: string | null;
  risk_score: number;
  total_issues: number;
  analysis_duration_ms: number | null;
  created_at: string;
  findings: DisputeFinding[];
}

export interface ContractDetailResponse extends ContractResponse {
  original_text: string;
  analysis_results: AnalysisResult[];
}

export interface PaginatedFindings {
  items: DisputeFinding[];
  total: number;
  page: number;
  page_size: number;
}

export const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  ambiguous_language: "Ambiguous Language",
  vague_timeframe: "Vague Timeframe",
  undefined_term: "Undefined Term",
  missing_quantity: "Missing Quantity",
  unclear_obligation: "Unclear Obligation",
  missing_clause: "Missing Clause",
  other: "Other",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  high: "text-red-600 bg-red-50 border-red-200",
  medium: "text-amber-600 bg-amber-50 border-amber-200",
  low: "text-green-600 bg-green-50 border-green-200",
};
