import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { contractsApi } from "../api/contracts";
import FindingCard from "../components/FindingCard";
import RiskScoreGauge from "../components/RiskScoreGauge";
import type { ContractDetailResponse } from "../types/contracts";
import { ISSUE_TYPE_LABELS } from "../types/contracts";

interface StructuredSummary {
  overview: string;
  strengths: string[];
  concerns: string[];
  recommendation: string;
}

function parseSummary(
  raw: string | null | undefined,
): StructuredSummary | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.overview) return parsed as StructuredSummary;
  } catch {
    // Legacy plain-text summary — wrap it
    return {
      overview: raw,
      strengths: [],
      concerns: [],
      recommendation: "",
    };
  }
  return null;
}

export default function AnalysisResults() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ContractDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    contractsApi
      .getResults(Number(id))
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || "Failed to load results"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleEmailReport = async () => {
    if (!id || !emailInput) return;
    try {
      await contractsApi.emailReport(Number(id), emailInput);
      setEmailStatus("Report sent!");
    } catch {
      setEmailStatus("Failed to send report");
    }
  };

  const analysis = data?.analysis_results?.[0];
  const findings = analysis?.findings || [];
  const summary = useMemo(
    () => parseSummary(analysis?.summary),
    [analysis?.summary],
  );

  const severityCounts = findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const issueTypeCounts = findings.reduce(
    (acc, f) => {
      acc[f.issue_type] = (acc[f.issue_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
        <Link to="/analyze" className="text-blue-600 mt-4 inline-block">
          ← Back to Analyzer
        </Link>
      </div>
    );

  if (!data) return null;

  const riskLevel =
    (analysis?.risk_score ?? 0) >= 70
      ? "high"
      : (analysis?.risk_score ?? 0) >= 40
        ? "medium"
        : "low";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/history" className="text-blue-600 text-sm hover:underline">
            ← All Contracts
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            {data.title}
          </h1>
          <p className="text-sm text-gray-500">
            Status: {data.status} | Analyzed:{" "}
            {analysis ? new Date(analysis.created_at).toLocaleString() : "N/A"}
          </p>
        </div>
      </div>

      {analysis && (
        <>
          {/* Overview Card */}
          {summary && (
            <div
              className={`rounded-xl border-2 p-6 mb-6 ${
                riskLevel === "high"
                  ? "bg-red-50 border-red-200"
                  : riskLevel === "medium"
                    ? "bg-amber-50 border-amber-200"
                    : "bg-green-50 border-green-200"
              }`}
            >
              <p
                className={`text-base font-medium ${
                  riskLevel === "high"
                    ? "text-red-900"
                    : riskLevel === "medium"
                      ? "text-amber-900"
                      : "text-green-900"
                }`}
              >
                {summary.overview}
              </p>
              {summary.recommendation && (
                <p
                  className={`mt-3 text-sm italic ${
                    riskLevel === "high"
                      ? "text-red-700"
                      : riskLevel === "medium"
                        ? "text-amber-700"
                        : "text-green-700"
                  }`}
                >
                  💡 {summary.recommendation}
                </p>
              )}
            </div>
          )}

          {/* Score + Counts Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <RiskScoreGauge score={analysis.risk_score} />

            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Issues by Severity
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-red-600 font-medium">High</span>
                  <span className="font-bold">{severityCounts.high || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-600 font-medium">Medium</span>
                  <span className="font-bold">
                    {severityCounts.medium || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600 font-medium">Low</span>
                  <span className="font-bold">{severityCounts.low || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Issues by Type
              </h3>
              <div className="space-y-1">
                {Object.entries(issueTypeCounts).length > 0 ? (
                  Object.entries(issueTypeCounts).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {ISSUE_TYPE_LABELS[
                          type as keyof typeof ISSUE_TYPE_LABELS
                        ] || type}
                      </span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No issues detected</p>
                )}
              </div>
            </div>
          </div>

          {/* Strengths & Concerns */}
          {summary &&
            (summary.strengths.length > 0 || summary.concerns.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Strengths */}
                {summary.strengths.length > 0 && (
                  <div className="bg-white rounded-xl border border-green-200 p-6">
                    <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Contract Strengths
                    </h3>
                    <ul className="space-y-2">
                      {summary.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="text-green-500 mt-0.5 shrink-0">
                            ✓
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Concerns */}
                {summary.concerns.length > 0 && (
                  <div className="bg-white rounded-xl border border-red-200 p-6">
                    <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Key Concerns
                    </h3>
                    <ul className="space-y-2">
                      {summary.concerns.map((c, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="text-red-500 mt-0.5 shrink-0">
                            ⚠
                          </span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

          {/* No-issues positive state */}
          {summary &&
            summary.concerns.length === 0 &&
            findings.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-green-500 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-green-800">
                  Contract Looks Good
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  No significant risks or ambiguities were detected in this
                  contract.
                </p>
              </div>
            )}

          {/* Findings */}
          {findings.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detailed Findings ({findings.length})
              </h2>
              {findings.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}

          {/* Model info */}
          {analysis.analysis_duration_ms && (
            <p className="text-xs text-gray-400 mb-4">
              Model: {analysis.model_used} | Duration:{" "}
              {(analysis.analysis_duration_ms / 1000).toFixed(1)}s
            </p>
          )}

          {/* Email report */}
          <div className="bg-gray-50 rounded-lg border p-4 mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Email Report</h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleEmailReport}
                disabled={!emailInput}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </div>
            {emailStatus && (
              <p className="text-sm mt-2 text-gray-600">{emailStatus}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
