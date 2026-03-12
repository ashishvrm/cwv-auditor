import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface HistoryEntry {
  timestamp: string;
  performance: number;
  lcp: number;
  tbt: number;
  cls: number;
  fcp: number;
  si: number;
  tti: number;
}

interface HistoricalChartProps {
  data: HistoryEntry[];
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    return data
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((entry) => ({
        ...entry,
        date: format(parseISO(entry.timestamp), 'MMM d'),
      }));
  }, [data]);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#e2e8f0',
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#94a3b8' }}
          />
          <Line 
            type="monotone" 
            dataKey="performance" 
            stroke="#3b82f6" 
            dot={false}
            name="Performance"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="lcp" 
            stroke="#ef4444" 
            dot={false}
            name="LCP"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="tbt" 
            stroke="#f59e0b" 
            dot={false}
            name="TBT"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalChart;
