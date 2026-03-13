import React from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Zap,
  Database,
  BarChart3,
  CircleDot,
  X,
} from 'lucide-react';
import type { AuditProgress, AuditStep, PageAuditStatus } from '../hooks/useRunAudit';

interface AuditProgressPanelProps {
  progress: AuditProgress;
  onDismiss?: () => void;
}

const STEP_CONFIG: Record<
  AuditStep,
  { label: string; icon: React.ReactNode; color: string }
> = {
  idle: { label: 'Ready', icon: <CircleDot size={16} />, color: 'text-slate-400' },
  initializing: {
    label: 'Initializing audit...',
    icon: <Database size={16} className="animate-pulse" />,
    color: 'text-blue-400',
  },
  auditing: {
    label: 'Running PageSpeed audits...',
    icon: <Zap size={16} className="animate-pulse" />,
    color: 'text-amber-400',
  },
  calculating: {
    label: 'Calculating averages...',
    icon: <BarChart3 size={16} className="animate-pulse" />,
    color: 'text-purple-400',
  },
  saving: {
    label: 'Saving results...',
    icon: <Database size={16} className="animate-pulse" />,
    color: 'text-blue-400',
  },
  completed: {
    label: 'Audit complete!',
    icon: <CheckCircle2 size={16} />,
    color: 'text-green-400',
  },
  failed: {
    label: 'Audit failed',
    icon: <XCircle size={16} />,
    color: 'text-red-400',
  },
};

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function getPageStatusIcon(status: PageAuditStatus) {
  switch (status) {
    case 'pending':
      return <CircleDot size={14} className="text-slate-500" />;
    case 'running':
      return <Loader2 size={14} className="animate-spin text-amber-400" />;
    case 'success':
      return <CheckCircle2 size={14} className="text-green-400" />;
    case 'failed':
      return <XCircle size={14} className="text-red-400" />;
    case 'skipped':
      return <CircleDot size={14} className="text-slate-600" />;
  }
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
}

const AuditProgressPanel: React.FC<AuditProgressPanelProps> = ({ progress, onDismiss }) => {
  if (progress.step === 'idle') return null;

  const stepConfig = STEP_CONFIG[progress.step];
  const completedPages = progress.successCount + progress.failCount;
  const percentComplete =
    progress.step === 'completed'
      ? 100
      : progress.step === 'failed'
        ? 0
        : progress.totalPages > 0
          ? Math.round((completedPages / progress.totalPages) * 100)
          : 0;

  const isActive = ['initializing', 'auditing', 'calculating', 'saving'].includes(progress.step);
  const isDone = progress.step === 'completed' || progress.step === 'failed';

  // Border color based on state
  const borderColor = progress.step === 'completed'
    ? 'border-green-800/60'
    : progress.step === 'failed'
      ? 'border-red-800/60'
      : 'border-blue-800/60';

  const bgColor = progress.step === 'completed'
    ? 'bg-green-950/30'
    : progress.step === 'failed'
      ? 'bg-red-950/30'
      : 'bg-slate-800/80';

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} backdrop-blur-sm p-5 mb-6 transition-all duration-300`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`${stepConfig.color}`}>{stepConfig.icon}</div>
          <div>
            <h3 className={`font-semibold text-sm ${stepConfig.color}`}>
              {stepConfig.label}
            </h3>
            {progress.step === 'auditing' && progress.currentPageName && (
              <p className="text-xs text-slate-400 mt-0.5">
                Page {progress.currentPageIndex + 1} of {progress.totalPages}:{' '}
                <span className="text-slate-300">{progress.currentPageName}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={12} />
            {formatElapsed(progress.elapsedMs)}
          </div>
          {isDone && onDismiss && (
            <button
              onClick={onDismiss}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-md hover:bg-slate-700/50"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>{completedPages} of {progress.totalPages} pages</span>
          <span>{percentComplete}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-700/80 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              progress.step === 'completed'
                ? 'bg-green-500'
                : progress.step === 'failed'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
            }`}
            style={{ width: `${percentComplete}%` }}
          />
          {isActive && percentComplete < 100 && (
            <div
              className="h-full rounded-full bg-blue-400/30 animate-pulse -mt-2"
              style={{ width: `${Math.min(percentComplete + 8, 100)}%` }}
            />
          )}
        </div>
      </div>

      {/* Per-page status grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {progress.pages.map((page) => (
          <div
            key={page.pageId}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-all duration-200 ${
              page.status === 'running'
                ? 'bg-amber-950/30 border border-amber-800/40'
                : page.status === 'success'
                  ? 'bg-green-950/20 border border-green-800/30'
                  : page.status === 'failed'
                    ? 'bg-red-950/20 border border-red-800/30'
                    : 'bg-slate-800/40 border border-slate-700/30'
            }`}
          >
            {getPageStatusIcon(page.status)}
            <span
              className={`truncate ${
                page.status === 'running'
                  ? 'text-amber-300'
                  : page.status === 'success'
                    ? 'text-slate-300'
                    : page.status === 'failed'
                      ? 'text-red-300'
                      : 'text-slate-500'
              }`}
            >
              {page.pageName}
            </span>
            {page.score !== undefined && (
              <span className={`ml-auto font-mono font-semibold ${getScoreColor(page.score)}`}>
                {page.score}
              </span>
            )}
            {page.status === 'failed' && (
              <span className="ml-auto text-red-400" title={page.error}>
                Error
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Summary when done */}
      {progress.step === 'completed' && (
        <div className="mt-4 pt-3 border-t border-green-800/30 flex items-center gap-4 text-xs">
          <span className="text-green-400 font-medium">
            {progress.successCount} page{progress.successCount !== 1 ? 's' : ''} audited successfully
          </span>
          {progress.failCount > 0 && (
            <span className="text-red-400">
              {progress.failCount} failed
            </span>
          )}
          <span className="text-slate-500 ml-auto">
            Completed in {formatElapsed(progress.elapsedMs)}
          </span>
        </div>
      )}

      {/* Error display */}
      {progress.error && (
        <div className="mt-4 pt-3 border-t border-red-800/30">
          <p className="text-xs text-red-400">{progress.error}</p>
        </div>
      )}
    </div>
  );
};

export default AuditProgressPanel;
