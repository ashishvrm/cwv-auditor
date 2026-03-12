import React, { useMemo } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface AuditData {
  results: Array<{
    pageId: string;
    lcp: number;
    tbt: number;
    cls: number;
    fcp: number;
    si: number;
    tti: number;
    unusedJs: number;
    unusedCss: number;
  }>;
}

interface PrioritiesTableProps {
  auditData: AuditData;
}

interface IssuePriority {
  pageId: string;
  metric: string;
  value: number;
  unit: string;
  status: 'error' | 'warning' | 'success';
  threshold: number;
  savings?: number;
}

const PrioritiesTable: React.FC<PrioritiesTableProps> = ({ auditData }) => {
  const issues = useMemo(() => {
    const allIssues: IssuePriority[] = [];

    auditData.results.forEach((result) => {
      // LCP issues
      if (result.lcp > 2500) {
        allIssues.push({
          pageId: result.pageId,
          metric: 'LCP',
          value: result.lcp,
          unit: 'ms',
          status: result.lcp > 4000 ? 'error' : 'warning',
          threshold: result.lcp > 4000 ? 4000 : 2500,
        });
      }

      // TBT issues
      if (result.tbt > 200) {
        allIssues.push({
          pageId: result.pageId,
          metric: 'TBT',
          value: result.tbt,
          unit: 'ms',
          status: result.tbt > 600 ? 'error' : 'warning',
          threshold: result.tbt > 600 ? 600 : 200,
        });
      }

      // CLS issues
      if (result.cls > 0.1) {
        allIssues.push({
          pageId: result.pageId,
          metric: 'CLS',
          value: result.cls,
          unit: '',
          status: result.cls > 0.25 ? 'error' : 'warning',
          threshold: result.cls > 0.25 ? 0.25 : 0.1,
        });
      }

      // FCP issues
      if (result.fcp > 1800) {
        allIssues.push({
          pageId: result.pageId,
          metric: 'FCP',
          value: result.fcp,
          unit: 'ms',
          status: result.fcp > 3000 ? 'error' : 'warning',
          threshold: result.fcp > 3000 ? 3000 : 1800,
        });
      }

      // SI issues
      if (result.si > 3400) {
        allIssues.push({
          pageId: result.pageId,
          metric: 'SI',
          value: result.si,
          unit: 'ms',
          status: result.si > 5800 ? 'error' : 'warning',
          threshold: result.si > 5800 ? 5800 : 3400,
        });
      }

      // TTI issues
      if (result.tti > 3800) {
        allIssues.push({
          pageId: result.pageId,
          metric: 'TTI',
          value: result.tti,
          unit: 'ms',
          status: result.tti > 7300 ? 'error' : 'warning',
          threshold: result.tti > 7300 ? 7300 : 3800,
        });
      }

      // Unused code
      if (result.unusedJs > 0) {
        allIssues.push({
          pageId: result.pageId,
          metric: 'Unused JS',
          value: result.unusedJs,
          unit: 'bytes',
          status: result.unusedJs > 50000 ? 'error' : 'warning',
          threshold: result.unusedJs,
          savings: result.unusedJs,
        });
      }

      if (result.unusedCss > 0) {
        allIssues.push({
          pageId: result.pageId,
          metric: 'Unused CSS',
          value: result.unusedCss,
          unit: 'bytes',
          status: result.unusedCss > 30000 ? 'error' : 'warning',
          threshold: result.unusedCss,
          savings: result.unusedCss,
        });
      }
    });

    return allIssues.sort((a, b) => {
      const statusOrder = { error: 0, warning: 1, success: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [auditData]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'error':
        return <AlertTriangle size={18} className="text-red-400" />;
      case 'warning':
        return <AlertCircle size={18} className="text-amber-400" />;
      case 'success':
        return <CheckCircle size={18} className="text-green-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-red-800 bg-red-950 p-4">
          <p className="text-xs text-red-400">Critical Issues</p>
          <p className="text-2xl font-bold text-red-200">
            {issues.filter((i) => i.status === 'error').length}
          </p>
        </div>
        <div className="rounded-lg border border-amber-800 bg-amber-950 p-4">
          <p className="text-xs text-amber-400">Warnings</p>
          <p className="text-2xl font-bold text-amber-200">
            {issues.filter((i) => i.status === 'warning').length}
          </p>
        </div>
        <div className="rounded-lg border border-green-800 bg-green-950 p-4">
          <p className="text-xs text-green-400">Healthy Metrics</p>
          <p className="text-2xl font-bold text-green-200">
            {issues.filter((i) => i.status === 'success').length}
          </p>
        </div>
      </div>

      {/* Issues Table */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Fix Priorities</h3>
        {issues.length === 0 ? (
          <div className="rounded-lg border border-green-800 bg-green-950 p-4 text-green-200">
            <p>All metrics are within acceptable thresholds!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-3 text-left font-medium text-slate-300">Status</th>
                  <th className="py-3 text-left font-medium text-slate-300">Page</th>
                  <th className="py-3 text-left font-medium text-slate-300">Metric</th>
                  <th className="py-3 text-left font-medium text-slate-300">Value</th>
                  <th className="py-3 text-left font-medium text-slate-300">Threshold</th>
                  <th className="py-3 text-left font-medium text-slate-300">Impact</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(issue.status)}
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">{issue.pageId}</td>
                    <td className="py-3 font-medium text-white">{issue.metric}</td>
                    <td className="py-3 text-slate-300">
                      {typeof issue.value === 'number'
                        ? issue.value.toFixed(issue.unit === '' ? 2 : 0) + issue.unit
                        : issue.value}
                    </td>
                    <td className="py-3 text-slate-400">
                      {typeof issue.threshold === 'number'
                        ? issue.threshold.toFixed(issue.unit === '' ? 2 : 0) + issue.unit
                        : issue.threshold}
                    </td>
                    <td className="py-3">
                      {issue.savings ? (
                        <span className="text-amber-400">
                          Save {formatBytes(issue.savings)}
                        </span>
                      ) : (
                        <span className="text-slate-400">High</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Recommendations</h3>
        <ul className="space-y-2">
          {issues.filter((i) => i.status === 'error').length > 0 && (
            <li className="flex gap-2 text-red-200">
              <span className="font-semibold">1.</span>
              <span>Address critical metrics immediately to improve user experience</span>
            </li>
          )}
          {issues.some((i) => i.metric.includes('Unused')) && (
            <li className="flex gap-2 text-amber-200">
              <span className="font-semibold">2.</span>
              <span>Remove unused code and optimize asset delivery</span>
            </li>
          )}
          {issues.some((i) => i.metric === 'LCP') && (
            <li className="flex gap-2 text-amber-200">
              <span className="font-semibold">3.</span>
              <span>Optimize images and defer non-critical resources to improve LCP</span>
            </li>
          )}
          {issues.length === 0 && (
            <li className="flex gap-2 text-green-200">
              <span>Keep monitoring regularly to maintain these excellent scores</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default PrioritiesTable;
