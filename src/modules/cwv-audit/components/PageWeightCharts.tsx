import React from 'react';

interface AuditData {
  results: Array<{
    pageId: string;
    pageWeight: number;
    networkRequests: number;
    unusedJs: number;
    unusedCss: number;
  }>;
}

interface PageWeightChartsProps {
  auditData: AuditData;
}

const PageWeightCharts: React.FC<PageWeightChartsProps> = ({ auditData }) => {
  const avgWeight =
    auditData.results.length > 0
      ? auditData.results.reduce((sum, r) => sum + r.pageWeight, 0) /
        auditData.results.length
      : 0;

  const avgRequests =
    auditData.results.length > 0
      ? auditData.results.reduce((sum, r) => sum + r.networkRequests, 0) /
        auditData.results.length
      : 0;

  const totalUnusedJs = auditData.results.reduce((sum, r) => sum + r.unusedJs, 0);
  const totalUnusedCss = auditData.results.reduce((sum, r) => sum + r.unusedCss, 0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">Average Page Weight</p>
          <p className="text-2xl font-bold text-white">{formatBytes(avgWeight)}</p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">Average Network Requests</p>
          <p className="text-2xl font-bold text-white">{Math.round(avgRequests)}</p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">Total Unused JavaScript</p>
          <p className="text-2xl font-bold text-white">{formatBytes(totalUnusedJs)}</p>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
          <p className="mb-2 text-xs text-slate-400">Total Unused CSS</p>
          <p className="text-2xl font-bold text-white">{formatBytes(totalUnusedCss)}</p>
        </div>
      </div>

      {/* Per-Page Details */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Per-Page Weight Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-3 text-left font-medium text-slate-300">Page ID</th>
                <th className="py-3 text-left font-medium text-slate-300">Total Size</th>
                <th className="py-3 text-left font-medium text-slate-300">Requests</th>
                <th className="py-3 text-left font-medium text-slate-300">Unused JS</th>
                <th className="py-3 text-left font-medium text-slate-300">Unused CSS</th>
              </tr>
            </thead>
            <tbody>
              {auditData.results.map((result) => (
                <tr key={result.pageId} className="border-b border-slate-700 hover:bg-slate-800">
                  <td className="py-3 text-slate-300">{result.pageId}</td>
                  <td className="py-3 text-slate-300">{formatBytes(result.pageWeight)}</td>
                  <td className="py-3 text-slate-300">{result.networkRequests}</td>
                  <td className="py-3 text-slate-300">{formatBytes(result.unusedJs)}</td>
                  <td className="py-3 text-slate-300">{formatBytes(result.unusedCss)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Optimization Opportunities</h3>
        <div className="space-y-3">
          {totalUnusedJs > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3">
              <span className="text-slate-300">Remove unused JavaScript</span>
              <span className="font-semibold text-amber-400">{formatBytes(totalUnusedJs)} potential savings</span>
            </div>
          )}
          {totalUnusedCss > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3">
              <span className="text-slate-300">Remove unused CSS</span>
              <span className="font-semibold text-amber-400">{formatBytes(totalUnusedCss)} potential savings</span>
            </div>
          )}
          {totalUnusedJs === 0 && totalUnusedCss === 0 && (
            <div className="rounded-lg bg-green-900 p-3 text-green-200">
              <p>No major optimization opportunities detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageWeightCharts;
