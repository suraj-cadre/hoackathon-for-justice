import { useEffect, useState } from "react";
import { healthApi } from "../api/contracts";

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
      setError(err.message || "Cannot reach backend");
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-6">
        System Health
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mb-6 text-sm">
          Backend unreachable: {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${live ? "bg-green-500" : "bg-slate-300"}`}
            />
            <h2 className="text-sm font-semibold text-slate-700">Liveness</h2>
          </div>
          {live ? (
            <pre className="text-xs bg-slate-50 p-4 rounded-xl text-slate-600 overflow-x-auto">
              {JSON.stringify(live, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-slate-400">Checking...</p>
          )}
        </div>

        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${ready ? "bg-green-500" : "bg-slate-300"}`}
            />
            <h2 className="text-sm font-semibold text-slate-700">Readiness</h2>
          </div>
          {ready ? (
            <pre className="text-xs bg-slate-50 p-4 rounded-xl text-slate-600 overflow-x-auto">
              {JSON.stringify(ready, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-slate-400">Checking...</p>
          )}
        </div>
      </div>

      <button
        onClick={checkHealth}
        className="mt-6 px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 active:scale-[0.98] transition-all"
      >
        Refresh
      </button>
    </div>
  );
}
