import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { contractsApi } from "../api/contracts";
import type { ContractResponse, ContractStatus } from "../types/contracts";

const STATUS_BADGES: Record<ContractStatus, string> = {
  uploaded: "bg-slate-100 text-slate-600",
  analyzing: "bg-primary-100 text-primary-700",
  analyzed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function AnalysisHistory() {
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contractsApi
      .list()
      .then((res) => setContracts(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          History
        </h1>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 active:scale-[0.98] transition-all shadow-md shadow-primary-600/20"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          New Analysis
        </Link>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg
              className="w-7 h-7 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-700 mb-1">
            No contracts yet
          </p>
          <p className="text-sm text-slate-400 mb-4">
            Get started by analyzing your first contract
          </p>
          <Link
            to="/analyze"
            className="text-primary-600 text-sm font-medium hover:underline"
          >
            Analyze a contract &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">
                    {contract.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(contract.created_at).toLocaleDateString(
                      undefined,
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGES[contract.status]}`}
                  >
                    {contract.status}
                  </span>
                  {contract.status === "analyzed" && (
                    <Link
                      to={`/results/${contract.id}`}
                      className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1"
                    >
                      View
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
