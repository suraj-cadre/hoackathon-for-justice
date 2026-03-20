import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { contractsApi } from '../api/contracts';
import type { ContractResponse, ContractStatus } from '../types/contracts';

const STATUS_BADGES: Record<ContractStatus, string> = {
  uploaded: 'bg-gray-100 text-gray-700',
  analyzing: 'bg-blue-100 text-blue-700',
  analyzed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
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
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analysis History</h1>
        <Link
          to="/analyze"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          + New Analysis
        </Link>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No contracts analyzed yet</p>
          <Link to="/analyze" className="text-blue-600 hover:underline">
            Analyze your first contract →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {contract.title}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_BADGES[contract.status]}`}
                    >
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(contract.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {contract.status === 'analyzed' && (
                      <Link
                        to={`/results/${contract.id}`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View Results
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
