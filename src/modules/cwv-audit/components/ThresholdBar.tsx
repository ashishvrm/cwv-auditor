import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { MetricStatus } from '../../../types/cwv';
import { getStatusColor, formatMetricValue } from '../utils/metrics';

interface DataPoint {
  name: string;
  value: number;
  status: MetricStatus;
}

interface ThresholdBarProps {
  data: DataPoint[];
  goodThreshold: number;
  poorThreshold: number;
  unit: string;
  title: string;
}

export const ThresholdBar: React.FC<ThresholdBarProps> = ({
  data,
  goodThreshold,
  poorThreshold,
  unit,
  title,
}) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis type="number" stroke="#9ca3af" />
          <YAxis dataKey="name" type="category" width={180} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '0.5rem',
              color: '#f1f5f9',
            }}
            formatter={(value) => formatMetricValue(value as number, unit)}
            labelStyle={{ color: '#f1f5f9' }}
          />

          {/* Good threshold reference line */}
          <ReferenceLine
            x={goodThreshold}
            stroke="#10b981"
            strokeDasharray="5 5"
            label={{
              value: `Good: ${formatMetricValue(goodThreshold, unit)}`,
              position: 'insideTopRight',
              offset: -5,
              fill: '#10b981',
              fontSize: 12,
            }}
          />

          {/* Poor threshold reference line */}
          <ReferenceLine
            x={poorThreshold}
            stroke="#ef4444"
            strokeDasharray="5 5"
            label={{
              value: `Poor: ${formatMetricValue(poorThreshold, unit)}`,
              position: 'insideTopRight',
              offset: 10,
              fill: '#ef4444',
              fontSize: 12,
            }}
          />

          <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThresholdBar;
