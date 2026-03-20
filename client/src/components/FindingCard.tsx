import { useState } from "react";
import type { DisputeFinding } from "../types/contracts";
import { ISSUE_TYPE_LABELS, SEVERITY_COLORS } from "../types/contracts";

interface FindingCardProps {
  finding: DisputeFinding;
}

export default function FindingCard({ finding }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden transition-all">
      <div
        className="flex items-center justify-between cursor-pointer p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${SEVERITY_COLORS[finding.severity]}`}
          >
            {finding.severity.toUpperCase()}
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
            {ISSUE_TYPE_LABELS[finding.issue_type]}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </div>

      <p className="px-5 pb-4 -mt-1 text-sm text-slate-600 line-clamp-2">
        {finding.explanation}
      </p>

      {expanded && (
        <div className="px-5 pb-5 space-y-3 animate-fade-in">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Original Clause
            </h4>
            <p className="text-sm bg-red-50/70 p-4 rounded-xl border border-red-100 text-red-800 leading-relaxed">
              {finding.clause_text}
            </p>
          </div>

          {finding.suggested_revision && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Suggested Revision
              </h4>
              <p className="text-sm bg-green-50/70 p-4 rounded-xl border border-green-100 text-green-800 leading-relaxed">
                {finding.suggested_revision}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
