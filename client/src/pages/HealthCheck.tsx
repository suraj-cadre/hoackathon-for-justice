import { useEffect, useState } from 'react';
import { healthApi } from '../api/contracts';

export default function HealthCheck() {
  const [live, setLive] = useState<any>(null);
  const [ready, setReady] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setError(null);
    try {
      const [liveRes, readyRes] = await Promise.all([
        healthApi.live(),
        healthApi.ready(),
      ]);
      setLive(liveRes.data);
      setReady(readyRes.data);
    } catch (err: any) {
      setError(err.message || 'Cannot reach backend');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Health</h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
          Backend unreachable: {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-gray-700 mb-2">Liveness</h2>
          {live ? (
            <pre className="text-sm bg-gray-50 p-3 rounded">
              {JSON.stringify(live, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">Checking...</p>
          )}
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold text-gray-700 mb-2">Readiness</h2>
          {ready ? (
            <pre className="text-sm bg-gray-50 p-3 rounded">
              {JSON.stringify(ready, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-500">Checking...</p>
          )}
        </div>
      </div>

      <button
        onClick={checkHealth}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  );
}
