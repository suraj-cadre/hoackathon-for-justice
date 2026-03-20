import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contractsApi } from '../api/contracts';
import type { ContractDetailResponse } from '../types/contracts';
import { ISSUE_TYPE_LABELS } from '../types/contracts';
import RiskScoreGauge from '../components/RiskScoreGauge';
import FindingCard from '../components/FindingCard';

export default function AnalysisResults() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ContractDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    contractsApi
      .getResults(Number(id))
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load results'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEmailReport = async () => {
    if (!id || !emailInput) return;
    try {
      await contractsApi.emailReport(Number(id), emailInput);
      setEmailStatus('Report sent!');
    } catch {
      setEmailStatus('Failed to send report');
    }
  };

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

  const analysis = data.analysis_results?.[0];
  const findings = analysis?.findings || [];

  // Count by severity
  const severityCounts = findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Count by issue type
  const issueTypeCounts = findings.reduce(
    (acc, f) => {
      acc[f.issue_type] = (acc[f.issue_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/history" className="text-blue-600 text-sm hover:underline">
            ← All Contracts
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{data.title}</h1>
          <p className="text-sm text-gray-500">
            Status: {data.status} | Analyzed:{' '}
            {analysis ? new Date(analysis.created_at).toLocaleString() : 'N/A'}
          </p>
        </div>
      </div>

      {analysis && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                  <span className="font-bold">{severityCounts.medium || 0}</span>
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
                {Object.entries(issueTypeCounts).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {ISSUE_TYPE_LABELS[type as keyof typeof ISSUE_TYPE_LABELS]}
                    </span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary text */}
          {analysis.summary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-1">Summary</h3>
              <p className="text-blue-800 text-sm">{analysis.summary}</p>
              {analysis.analysis_duration_ms && (
                <p className="text-xs text-blue-600 mt-2">
                  Model: {analysis.model_used} | Duration:{' '}
                  {(analysis.analysis_duration_ms / 1000).toFixed(1)}s
                </p>
              )}
            </div>
          )}

          {/* Findings */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Findings ({findings.length})
            </h2>
            {findings.length > 0 ? (
              findings.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))
            ) : (
              <p className="text-gray-500">No issues found.</p>
            )}
          </div>

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
