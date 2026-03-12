import React from 'react';
import type { AuditRun } from '../../../types/cwv';
import { formatMetricValue } from '../utils/metrics';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface AuditRunCardProps {
  run: AuditRun;
}

export const AuditRunCard: React.FC<AuditRunCardProps> = ({ run }) => {
  const getStatusIcon = () => {
    switch (run.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStatusColor = () => {
    switch (run.status) {
      case 'completed':
        return 'bg-emerald-900 text-emerald-200';
      case 'running':
        return 'bg-blue-900 text-blue-200';
      case 'failed':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-gray-900 text-gray-200';
    }
  };

  const formatDate = (date: any) => {
    try {
      return new Date(date.toDate()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      {/* Header with status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon()}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor()}`}>
              {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
            </span>
          </div>
          <p className="text-sm text-gray-400">{formatDate(run.runDate)}</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-500 mb-1">Strategy</p>
          <p className="text-sm font-semibold text-blue-400">
            {run.strategy.charAt(0).toUpperCase() + run.strategy.slice(1)}
          </p>
        </div>
      </div>

      {/* Triggered by info */}
      <div className="mb-4 pb-4 border-b border-slate-700">
        <p className="text-xs text-gray-500 mb-1">Triggered By</p>
        <p className="text-sm text-gray-300 capitalize">
          {run.triggeredBy}
          {run.triggeredByUser && ` - ${run.triggeredByUser}`}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-700">
        <div>
          <p className="text-xs text-emerald-400 font-semibold">{run.summary.good}</p>
          <p className="text-xs text-gray-500">Good</p>
        </div>
        <div>
          <p className="text-xs text-amber-400 font-semibold">{run.summary.needsImprovement}</p>
          <p className="text-xs text-gray-500">Needs Improvement</p>
        </div>
        <div>
          <p className="text-xs text-red-400 font-semibold">{run.summary.poor}</p>
          <p className="text-xs text-gray-500">Poor</p>
        </div>
      </div>

      {/* Average metrics */}
      <div>
        <p className="text-xs text-gray-400 font-semibold mb-3">Average Metrics</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Performance Score</p>
            <p className="font-mono text-lg font-bold text-blue-400">
              {Math.round(run.avgPerformanceScore)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">LCP</p>
            <p className="font-mono text-lg font-bold text-blue-400">
              {formatMetricValue(run.avgLCP, 'ms')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">TBT</p>
            <p className="font-mono text-lg font-bold text-blue-400">
              {formatMetricValue(run.avgTBT, 'ms')}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">CLS</p>
            <p className="font-mono text-lg font-bold text-blue-400">
              {run.avgCLS.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      {/* Error message if failed */}
      {run.status === 'failed' && run.errorMessage && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-red-400">Error:</p>
          <p className="text-xs text-gray-400 mt-1">{run.errorMessage}</p>
        </div>
      )}

      {/* Pages audited info */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <p className="text-xs text-gray-500">
          <span className="font-semibold text-gray-300">{run.pagesAudited}</span> pages audited
        </p>
      </div>
    </div>
  );
};

export default AuditRunCard;
