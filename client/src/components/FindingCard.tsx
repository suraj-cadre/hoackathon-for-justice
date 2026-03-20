import { useState } from 'react';
import type { DisputeFinding } from '../types/contracts';
import { ISSUE_TYPE_LABELS, SEVERITY_COLORS } from '../types/contracts';

interface FindingCardProps {
  finding: DisputeFinding;
}

export default function FindingCard({ finding }: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 mb-3 bg-white shadow-sm">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded border ${SEVERITY_COLORS[finding.severity]}`}
          >
            {finding.severity.toUpperCase()}
          </span>
          <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700">
            {ISSUE_TYPE_LABELS[finding.issue_type]}
          </span>
        </div>
        <button className="text-gray-400 hover:text-gray-600 text-sm">
          {expanded ? '▲' : '▼'}
        </button>
      </div>

      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
        {finding.explanation}
      </p>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
              Original Clause
            </h4>
            <p className="text-sm bg-red-50 p-3 rounded border border-red-100 text-red-800">
              {finding.clause_text}
            </p>
          </div>

          {finding.suggested_revision && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Suggested Revision
              </h4>
              <p className="text-sm bg-green-50 p-3 rounded border border-green-100 text-green-800">
                {finding.suggested_revision}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
