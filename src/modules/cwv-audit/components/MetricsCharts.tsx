import React from 'react';
import StatusBadge from './StatusBadge';

interface AuditData {
  results: Array<{
    pageId: string;
    performance: { score: number };
    lcp: number;
    tbt: number;
    cls: number;
    fcp: number;
    si: number;
    tti: number;
  }>;
}

interface MetricsChartsProps {
  auditData: AuditData;
}

const MetricsCharts: React.FC<MetricsChartsProps> = ({ auditData }) => {
  const getStatusColor = (value: number, good: number, poor: number) => {
    if (value <= good) return 'success';
    if (value >= poor) return 'error';
    return 'warning';
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Performance Score */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">Performance Score</p>
          <p className="mb-3 text-3xl font-bold text-white">
            {Math.round(
              auditData.results.reduce((sum, r) => sum + r.performance.score, 0) /
                auditData.results.length
            )}
          </p>
          <p className="text-xs text-slate-400">{auditData.results.length} pages</p>
        </div>

        {/* LCP */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">Largest Contentful Paint</p>
          <p className="mb-3 text-3xl font-bold text-white">
            {Math.round(auditData.results.reduce((sum, r) => sum + r.lcp, 0) / auditData.results.length)}
            ms
          </p>
          <StatusBadge
            value={
              auditData.results.reduce((sum, r) => sum + r.lcp, 0) /
              auditData.results.length
            }
            unit="ms"
            status={getStatusColor(
              auditData.results.reduce((sum, r) => sum + r.lcp, 0) /
                auditData.results.length,
              2500,
              4000
            )}
          />
        </div>

        {/* TBT */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">Total Blocking Time</p>
          <p className="mb-3 text-3xl font-bold text-white">
            {Math.round(auditData.results.reduce((sum, r) => sum + r.tbt, 0) / auditData.results.length)}
            ms
          </p>
          <StatusBadge
            value={
              auditData.results.reduce((sum, r) => sum + r.tbt, 0) /
              auditData.results.length
            }
            unit="ms"
            status={getStatusColor(
              auditData.results.reduce((sum, r) => sum + r.tbt, 0) /
                auditData.results.length,
              200,
              600
            )}
          />
        </div>

        {/* CLS */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">Cumulative Layout Shift</p>
          <p className="mb-3 text-3xl font-bold text-white">
            {(
              auditData.results.reduce((sum, r) => sum + r.cls, 0) /
              auditData.results.length
            ).toFixed(2)}
          </p>
          <StatusBadge
            value={
              auditData.results.reduce((sum, r) => sum + r.cls, 0) /
              auditData.results.length
            }
            unit=""
            status={getStatusColor(
              auditData.results.reduce((sum, r) => sum + r.cls, 0) /
                auditData.results.length,
              0.1,
              0.25
            )}
          />
        </div>

        {/* FCP */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">First Contentful Paint</p>
          <p className="mb-3 text-3xl font-bold text-white">
            {Math.round(auditData.results.reduce((sum, r) => sum + r.fcp, 0) / auditData.results.length)}
            ms
          </p>
          <StatusBadge
            value={
              auditData.results.reduce((sum, r) => sum + r.fcp, 0) /
              auditData.results.length
            }
            unit="ms"
            status={getStatusColor(
              auditData.results.reduce((sum, r) => sum + r.fcp, 0) /
                auditData.results.length,
              1800,
              3000
            )}
          />
        </div>

        {/* Speed Index */}
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">Speed Index</p>
          <p className="mb-3 text-3xl font-bold text-white">
            {Math.round(auditData.results.reduce((sum, r) => sum + r.si, 0) / auditData.results.length)}
            ms
          </p>
          <StatusBadge
            value={
              auditData.results.reduce((sum, r) => sum + r.si, 0) /
              auditData.results.length
            }
            unit="ms"
            status={getStatusColor(
              auditData.results.reduce((sum, r) => sum + r.si, 0) /
                auditData.results.length,
              3400,
              5800
            )}
          />
        </div>
      </div>

      {/* Per-Page Breakdown */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Per-Page Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-3 text-left font-medium text-slate-300">Page ID</th>
                <th className="py-3 text-left font-medium text-slate-300">Performance</th>
                <th className="py-3 text-left font-medium text-slate-300">LCP</th>
                <th className="py-3 text-left font-medium text-slate-300">TBT</th>
                <th className="py-3 text-left font-medium text-slate-300">CLS</th>
              </tr>
            </thead>
            <tbody>
              {auditData.results.map((result) => (
                <tr key={result.pageId} className="border-b border-slate-700 hover:bg-slate-800">
                  <td className="py-3 text-slate-300">{result.pageId}</td>
                  <td className="py-3 text-slate-300">{Math.round(result.performance.score)}</td>
                  <td className="py-3">
                    <StatusBadge
                      value={result.lcp}
                      unit="ms"
                      status={getStatusColor(result.lcp, 2500, 4000)}
                    />
                  </td>
                  <td className="py-3">
                    <StatusBadge
                      value={result.tbt}
                      unit="ms"
                      status={getStatusColor(result.tbt, 200, 600)}
                    />
                  </td>
                  <td className="py-3">
                    <StatusBadge
                      value={result.cls}
                      unit=""
                      status={getStatusColor(result.cls, 0.1, 0.25)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetricsCharts;
