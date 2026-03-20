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
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );

  if (error)
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
          {error}
        </div>
        <Link
          to="/analyze"
          className="text-primary-600 mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to Analyzer
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
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/history"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-3"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          All Contracts
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          {data.title}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              data.status === "analyzed"
                ? "bg-green-100 text-green-700"
                : data.status === "analyzing"
                  ? "bg-primary-100 text-primary-700"
                  : data.status === "failed"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-700"
            }`}
          >
            {data.status}
          </span>
          {analysis && (
            <span className="text-sm text-slate-400">
              {new Date(analysis.created_at).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* Overview Card */}
          {summary && (
            <div
              className={`rounded-2xl border p-6 ${
                riskLevel === "high"
                  ? "bg-red-50/60 border-red-200"
                  : riskLevel === "medium"
                    ? "bg-amber-50/60 border-amber-200"
                    : "bg-green-50/60 border-green-200"
              }`}
            >
              <p
                className={`text-base leading-relaxed ${
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
                  {summary.recommendation}
                </p>
              )}
            </div>
          )}

          {/* Score + Counts Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RiskScoreGauge score={analysis.risk_score} />

            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                By Severity
              </h3>
              <div className="space-y-3">
                {[
                  {
                    label: "High",
                    count: severityCounts.high || 0,
                    color: "text-red-600",
                    dot: "bg-red-500",
                  },
                  {
                    label: "Medium",
                    count: severityCounts.medium || 0,
                    color: "text-amber-600",
                    dot: "bg-amber-500",
                  },
                  {
                    label: "Low",
                    count: severityCounts.low || 0,
                    color: "text-green-600",
                    dot: "bg-green-500",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2 text-sm text-slate-700">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    <span className={`text-lg font-bold ${s.color}`}>
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                By Type
              </h3>
              <div className="space-y-2">
                {Object.entries(issueTypeCounts).length > 0 ? (
                  Object.entries(issueTypeCounts).map(([type, count]) => (
                    <div
                      key={type}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-slate-600">
                        {ISSUE_TYPE_LABELS[
                          type as keyof typeof ISSUE_TYPE_LABELS
                        ] || type}
                      </span>
                      <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No issues detected</p>
                )}
              </div>
            </div>
          </div>

          {/* Strengths & Concerns */}
          {summary &&
            (summary.strengths.length > 0 || summary.concerns.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.strengths.length > 0 && (
                  <div className="bg-white rounded-2xl border border-green-200/80 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {summary.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <span className="text-green-500 mt-0.5 shrink-0">
                            &#10003;
                          </span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.concerns.length > 0 && (
                  <div className="bg-white rounded-2xl border border-red-200/80 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Concerns
                    </h3>
                    <ul className="space-y-2">
                      {summary.concerns.map((c, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <span className="text-red-400 mt-0.5 shrink-0">
                            !
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
              <div className="bg-green-50/60 border border-green-200 rounded-2xl p-8 text-center">
                <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg
                    className="w-7 h-7 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-green-800">
                  Contract Looks Good
                </h3>
                <p className="text-sm text-green-600 mt-1">
                  No significant risks or ambiguities were detected.
                </p>
              </div>
            )}

          {/* Findings */}
          {findings.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Detailed Findings
                <span className="ml-2 text-sm font-normal text-slate-400">
                  ({findings.length})
                </span>
              </h2>
              <div className="space-y-3">
                {findings.map((finding) => (
                  <FindingCard key={finding.id} finding={finding} />
                ))}
              </div>
            </div>
          )}

          {/* Model info */}
          {analysis.analysis_duration_ms && (
            <p className="text-xs text-slate-400">
              Model: {analysis.model_used} &middot; Duration:{" "}
              {(analysis.analysis_duration_ms / 1000).toFixed(1)}s
            </p>
          )}

          {/* Email report */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Email Report
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 outline-none transition-all"
              />
              <button
                onClick={handleEmailReport}
                disabled={!emailInput}
                className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-40 transition-all"
              >
                Send
              </button>
            </div>
            {emailStatus && (
              <p className="text-sm mt-2 text-slate-500">{emailStatus}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
