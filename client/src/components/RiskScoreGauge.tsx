interface RiskScoreGaugeProps {
  score: number;
}

export default function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
  const color =
    score >= 70
      ? "text-red-600"
      : score >= 40
        ? "text-amber-600"
        : "text-green-600";

  const label =
    score >= 70 ? "High Risk" : score >= 40 ? "Medium Risk" : "Low Risk";

  const barColor =
    score >= 70
      ? "bg-gradient-to-r from-red-400 to-red-500"
      : score >= 40
        ? "bg-gradient-to-r from-amber-400 to-amber-500"
        : "bg-gradient-to-r from-green-400 to-green-500";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Risk Score
      </h3>
      <div className="text-center mb-4">
        <span className={`text-5xl font-extrabold tracking-tight ${color}`}>
          {score}
        </span>
        <span className="text-slate-300 text-lg font-medium">/100</span>
      </div>
      <div className="space-y-2">
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${barColor} transition-all duration-700 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className={`text-center text-xs font-medium ${color}`}>{label}</p>
      </div>
    </div>
  );
}
