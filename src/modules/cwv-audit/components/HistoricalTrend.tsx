import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface AuditResult {
  pageId: string;
  timestamp: string;
  performanceScore: number;
  lcp: number;
  tbt: number;
  cls: number;
  fcp: number;
  si: number;
  tti: number;
  pageWeight: number;
}

interface AuditRun {
  runId: string;
  createdAt: string;
  results?: AuditResult[];
}

interface HistoricalTrendProps {
  runs: AuditRun[];
}

const HistoricalTrend: React.FC<HistoricalTrendProps> = ({ runs }) => {
  const chartData = runs
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((run) => {
      const avgPerformance =
        run.results && run.results.length > 0
          ? run.results.reduce((sum, r) => sum + r.performanceScore, 0) / run.results.length
          : 0;

      const avgLcp =
        run.results && run.results.length > 0
          ? run.results.reduce((sum, r) => sum + r.lcp, 0) / run.results.length
          : 0;

      const avgTbt =
        run.results && run.results.length > 0
          ? run.results.reduce((sum, r) => sum + r.tbt, 0) / run.results.length
          : 0;

      return {
        date: format(parseISO(run.createdAt), 'MMM d, HH:mm'),
        performance: Math.round(avgPerformance),
        lcp: Math.round(avgLcp),
        tbt: Math.round(avgTbt),
      };
    });

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
            dot={true}
            name="Performance"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="lcp" 
            stroke="#ef4444" 
            dot={true}
            name="LCP (ms)"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="tbt" 
            stroke="#f59e0b" 
            dot={true}
            name="TBT (ms)"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalTrend;
