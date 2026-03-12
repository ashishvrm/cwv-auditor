import React from 'react';

interface ScoreGaugeProps {
  score: number;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score }) => {
  const getColor = (value: number) => {
    if (value >= 90) return '#10b981';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getColorClass = (value: number) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const normalizedScore = Math.min(100, Math.max(0, score));
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div className="relative h-28 w-28">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-slate-700"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor(normalizedScore)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${getColorClass(normalizedScore)}`}>
        {Math.round(normalizedScore)}
      </div>
    </div>
  );
};

export default ScoreGauge;
