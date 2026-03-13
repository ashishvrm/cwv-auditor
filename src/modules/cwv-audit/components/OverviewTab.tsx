import React from 'react';
import ScoreGauge from './ScoreGauge';
import StatusBadge from './StatusBadge';

interface AuditData {
  runId: string;
  timestamp: string;
  results: Array<{
    pageId: string;
    performanceScore: number;
    lcp: number;
    tbt: number;
    cls: number;
  }>;
}

interface OverviewTabProps {
  auditData: AuditData;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ auditData }) => {
  const avgPerformance =
    auditData.results.length > 0
      ? auditData.results.reduce((sum, r) => sum + (r.performanceScore ?? 0), 0) /
        auditData.results.length
      : 0;

  const avgLcp =
    auditData.results.length > 0
      ? auditData.results.reduce((sum, r) => sum + r.lcp, 0) / auditData.results.length
      : 0;

  const avgTbt =
    auditData.results.length > 0
      ? auditData.results.reduce((sum, r) => sum + r.tbt, 0) / auditData.results.length
      : 0;

  const avgCls =
    auditData.results.length > 0
      ? auditData.results.reduce((sum, r) => sum + r.cls, 0) / auditData.results.length
      : 0;

  const getStatusColor = (value: number, good: number, poor: number) => {
    if (value <= good) return 'success';
    if (value >= poor) return 'error';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Overall Performance</h3>
          <div className="flex items-center gap-6">
            <ScoreGauge score={avgPerformance} />
            <div>
              <p className="text-4xl font-bold text-white">{Math.round(avgPerformance)}</p>
              <p className="mt-2 text-sm text-slate-400">Average across {auditData.results.length} pages</p>
            </div>
          </div>
        </div>

        {/* Pages Audited */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">Audit Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Pages Audited</span>
              <span className="text-2xl font-bold text-white">{auditData.results.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Run ID</span>
              <span className="text-xs text-slate-300">{auditData.runId.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Core Web Vitals</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Largest Contentful Paint (LCP)</p>
            <p className="mb-3 text-3xl font-bold text-white">{Math.round(avgLcp)}ms</p>
            <StatusBadge
              value={avgLcp}
              unit="ms"
              status={getStatusColor(avgLcp, 2500, 4000)}
            />
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Total Blocking Time (TBT)</p>
            <p className="mb-3 text-3xl font-bold text-white">{Math.round(avgTbt)}ms</p>
            <StatusBadge
              value={avgTbt}
              unit="ms"
              status={getStatusColor(avgTbt, 200, 600)}
            />
          </div>

          <div className="rounded-lg bg-slate-800 p-4">
            <p className="mb-2 text-xs text-slate-400">Cumulative Layout Shift (CLS)</p>
            <p className="mb-3 text-3xl font-bold text-white">{avgCls.toFixed(2)}</p>
            <StatusBadge
              value={avgCls}
              unit=""
              status={getStatusColor(avgCls, 0.1, 0.25)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
