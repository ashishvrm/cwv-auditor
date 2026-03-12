import React from 'react';
import ScoreGauge from './ScoreGauge';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';

interface Metrics {
  pageId: string;
  url: string;
  timestamp: string;
  performance: { score: number };
  lcp: number;
  tbt: number;
  cls: number;
  fcp: number;
  si: number;
  tti: number;
  serverResponseTime: number;
  networkRequests: number;
  pageWeight: number;
  unusedJs: number;
  unusedCss: number;
}

interface PageDetailCardProps {
  metrics: Metrics;
}

const PageDetailCard: React.FC<PageDetailCardProps> = ({ metrics }) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (value: number, good: number, poor: number) => {
    if (value <= good) return 'success';
    if (value >= poor) return 'error';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{metrics.pageId}</h2>
            <p className="mt-1 text-sm text-slate-400">{metrics.url}</p>
          </div>
          <ScoreGauge score={metrics.performance.score} />
        </div>
        <p className="text-xs text-slate-400">
          Last audited: {format(new Date(metrics.timestamp), 'MMM d, yyyy h:mm a')}
        </p>
      </div>

      {/* Core Web Vitals */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Core Web Vitals</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Largest Contentful Paint</p>
            <p className="mb-3 text-3xl font-bold text-white">{metrics.lcp}ms</p>
            <StatusBadge
              value={metrics.lcp}
              unit="ms"
              status={getStatusColor(metrics.lcp, 2500, 4000)}
            />
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Total Blocking Time</p>
            <p className="mb-3 text-3xl font-bold text-white">{metrics.tbt}ms</p>
            <StatusBadge
              value={metrics.tbt}
              unit="ms"
              status={getStatusColor(metrics.tbt, 200, 600)}
            />
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Cumulative Layout Shift</p>
            <p className="mb-3 text-3xl font-bold text-white">{metrics.cls.toFixed(2)}</p>
            <StatusBadge
              value={metrics.cls}
              unit=""
              status={getStatusColor(metrics.cls, 0.1, 0.25)}
            />
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Additional Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">First Contentful Paint</p>
            <p className="text-2xl font-bold text-white">{metrics.fcp}ms</p>
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Speed Index</p>
            <p className="text-2xl font-bold text-white">{metrics.si}ms</p>
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Time to Interactive</p>
            <p className="text-2xl font-bold text-white">{metrics.tti}ms</p>
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Server Response Time</p>
            <p className="text-2xl font-bold text-white">{Math.round(metrics.serverResponseTime)}ms</p>
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Network Requests</p>
            <p className="text-2xl font-bold text-white">{metrics.networkRequests}</p>
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Page Weight</p>
            <p className="text-2xl font-bold text-white">{formatBytes(metrics.pageWeight)}</p>
          </div>
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Optimization Opportunities</h3>
        <div className="space-y-3">
          {metrics.unusedJs > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3">
              <span className="text-slate-300">Remove unused JavaScript</span>
              <span className="font-semibold text-amber-400">{formatBytes(metrics.unusedJs)}</span>
            </div>
          )}
          {metrics.unusedCss > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3">
              <span className="text-slate-300">Remove unused CSS</span>
              <span className="font-semibold text-amber-400">{formatBytes(metrics.unusedCss)}</span>
            </div>
          )}
          {metrics.unusedJs === 0 && metrics.unusedCss === 0 && (
            <div className="rounded-lg border border-green-800 bg-green-950 p-3 text-green-200">
              <p>No major unused code detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageDetailCard;
