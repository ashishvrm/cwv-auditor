import React from 'react';
import type { MetricStatus } from '../../../types/cwv';
import { getStatusBgColorTailwind, getStatusColorTailwind, formatMetricValue } from '../utils/metrics';

interface MetricCardProps {
  name: string;
  value: number;
  unit: string;
  status: MetricStatus;
  threshold: string;
  overCount?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  name,
  value,
  unit,
  status,
  threshold,
  overCount,
}) => {
  const statusColorClass = getStatusColorTailwind(status);
  const statusBgColorClass = getStatusBgColorTailwind(status);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Status bar */}
      <div className={`h-1 w-full ${statusBgColorClass}`} />

      <div className="p-4">
        {/* Metric name */}
        <p className="text-sm text-gray-400 mb-3 font-medium">{name}</p>

        {/* Value display */}
        <div className="mb-3">
          <p className={`font-mono text-2xl font-bold ${statusColorClass}`}>
            {formatMetricValue(value, unit)}
          </p>
          {overCount !== undefined && overCount > 0 && (
            <p className="text-xs text-gray-500 mt-1">{overCount}px over target</p>
          )}
        </div>

        {/* Threshold */}
        <p className="text-xs text-gray-500">{threshold}</p>
      </div>
    </div>
  );
};

export default MetricCard;
