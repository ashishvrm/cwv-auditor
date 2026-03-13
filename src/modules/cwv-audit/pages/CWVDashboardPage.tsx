import React, { useState } from 'react';
import { format } from 'date-fns';
import { useLatestAudit } from '../hooks/useLatestAudit';
import { useRunAudit } from '../hooks/useRunAudit';
import OverviewTab from '../components/OverviewTab';
import MetricsCharts from '../components/MetricsCharts';
import PageWeightCharts from '../components/PageWeightCharts';
import PrioritiesTable from '../components/PrioritiesTable';
import RunAuditButton from '../components/RunAuditButton';
import AuditProgressPanel from '../components/AuditProgressPanel';

type TabType = 'overview' | 'metrics' | 'weight' | 'priorities';

const CWVDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { run, results, loading, error, refetch } = useLatestAudit();
  const { runAudit, progress, isRunning: isAuditRunning, dismissProgress } = useRunAudit(refetch);

  const handleRunAudit = async () => {
    await runAudit();
  };

  const auditData = run ? {
    runId: run.id,
    timestamp: run.runDate.toDate().toISOString(),
    results: results as any,
  } : null;

  const lastAuditDate = run?.runDate
    ? format(new Date(run.runDate.toMillis()), 'MMM d, yyyy h:mm a')
    : 'Never';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">CWV Dashboard</h1>
            <p className="mt-2 text-slate-400">Core Web Vitals Performance Audit</p>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-400">Last audited</p>
              <p className="text-lg font-semibold text-white">{lastAuditDate}</p>
            </div>
            <RunAuditButton onClick={handleRunAudit} isLoading={isAuditRunning} />
          </div>
        </div>

        {/* Audit Progress Panel */}
        {progress.step !== 'idle' && (
          <AuditProgressPanel progress={progress} onDismiss={dismissProgress} />
        )}

        {/* Error State */}
        {error && progress.step === 'idle' && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950 p-4 text-red-200">
            <p className="font-semibold">Error loading audit data</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'metrics'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            CWV Metrics
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'weight'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Page Weight
          </button>
          <button
            onClick={() => setActiveTab('priorities')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'priorities'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Fix Priorities
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
              <p className="text-slate-400">Loading audit data...</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {!loading && auditData && (
          <div>
            {activeTab === 'overview' && <OverviewTab auditData={auditData} />}
            {activeTab === 'metrics' && <MetricsCharts auditData={auditData} />}
            {activeTab === 'weight' && <PageWeightCharts auditData={auditData} />}
            {activeTab === 'priorities' && <PrioritiesTable auditData={auditData} />}
          </div>
        )}

        {/* Empty State */}
        {!loading && !auditData && !error && !isAuditRunning && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-slate-400">No audit data available</p>
            <button
              onClick={handleRunAudit}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
            >
              Run First Audit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CWVDashboardPage;
