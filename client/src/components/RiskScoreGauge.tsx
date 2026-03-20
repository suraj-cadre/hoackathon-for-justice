interface RiskScoreGaugeProps {
  score: number;
}

export default function RiskScoreGauge({ score }: RiskScoreGaugeProps) {
  const color =
    score >= 70
      ? 'text-red-600'
      : score >= 40
        ? 'text-amber-500'
        : 'text-green-600';

  const bgColor =
    score >= 70
      ? 'bg-red-100'
      : score >= 40
        ? 'bg-amber-100'
        : 'bg-green-100';

  const barColor =
    score >= 70
      ? 'bg-red-500'
      : score >= 40
        ? 'bg-amber-500'
        : 'bg-green-500';

  return (
    <div className={`rounded-xl p-6 ${bgColor}`}>
      <div className="text-center">
        <span className={`text-5xl font-bold ${color}`}>{score}</span>
        <span className="text-gray-500 text-lg">/100</span>
      </div>
      <p className="text-center text-sm text-gray-600 mt-1">Risk Score</p>
      <div className="mt-3 w-full bg-white rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
