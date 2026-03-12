import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLatestAudit } from '../hooks/useLatestAudit';
import { MONITORED_PAGES } from '../constants/pages';
import ScoreGauge from '../components/ScoreGauge';
import StatusBadge from '../components/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

const CWVPagesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { results, loading, error } = useLatestAudit();

  const handlePageClick = (pageId: string) => {
    navigate(`/cwv-audit/pages/${pageId}`);
  };

  const getPageMetrics = (pageId: string) => {
    if (!results) return null;
    const result = results.find((r: any) => r.pageId === pageId);
    return result || null;
  };

  const getStatusColor = (value: number, good: number, poor: number): 'success' | 'warning' | 'error' => {
    if (value <= good) return 'success';
    if (value >= poor) return 'error';
    return 'warning';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Monitored Pages</h1>
          <p className="mt-2 text-slate-400">Performance metrics for all tracked pages</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950 p-4 text-red-200">
            <p className="font-semibold">Error loading audit data</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
              <p className="text-slate-400">Loading pages...</p>
            </div>
          </div>
        )}

        {/* Pages Grid */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MONITORED_PAGES.map((page) => {
              const metrics = getPageMetrics(page.id);

              return (
                <div
                  key={page.id}
                  onClick={() => handlePageClick(page.id)}
                  className="group cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-6 transition-all hover:border-blue-500 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  {/* Page Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">{page.name}</h3>
                      <p className="text-xs text-slate-400">{page.url}</p>
                    </div>
                    <span className="inline-block rounded-full bg-slate-700 px-2 py-1 text-xs font-medium text-slate-200">
                      {page.template}
                    </span>
                  </div>

                  {/* Metrics */}
                  {metrics ? (
                    <>
                      {/* Performance Score */}
                      <div className="mb-6 flex items-center gap-4">
                        <ScoreGauge score={(metrics as any).performanceScore} />
                        <div>
                          <p className="text-xs text-slate-400">Performance</p>
                          <p className="text-2xl font-bold text-white">
                            {Math.round((metrics as any).performanceScore)}
                          </p>
                        </div>
                      </div>

                      {/* CWV Metrics */}
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">LCP:</span>
                          <StatusBadge
                            value={metrics.lcp}
                            unit="ms"
                            status={getStatusColor(metrics.lcp, 2500, 4000)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">TBT:</span>
                          <StatusBadge
                            value={metrics.tbt}
                            unit="ms"
                            status={getStatusColor(metrics.tbt, 200, 600)}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">CLS:</span>
                          <StatusBadge
                            value={parseFloat(metrics.cls.toFixed(2))}
                            unit=""
                            status={getStatusColor(metrics.cls, 0.1, 0.25)}
                          />
                        </div>
                      </div>

                      {/* Last Checked */}
                      <div className="border-t border-slate-700 pt-4">
                        <p className="text-xs text-slate-400">
                          Last checked{' '}
                          {formatDistanceToNow(new Date((metrics as any).runDate.toDate()), { addSuffix: true })}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-sm text-slate-400">No data available</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CWVPagesListPage;
