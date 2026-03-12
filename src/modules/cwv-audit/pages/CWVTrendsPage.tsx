import React, { useState, useMemo } from 'react';
import { useAuditRuns } from '../hooks/useAuditRuns';
import { MONITORED_PAGES } from '../constants/pages';
import HistoricalTrend from '../components/HistoricalTrend';
import ComparisonTable from '../components/ComparisonTable';

const CWVTrendsPage: React.FC = () => {
  const { runs, loading, error } = useAuditRuns();
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(
    new Set(MONITORED_PAGES.map((p) => p.id))
  );

  const togglePage = (pageId: string) => {
    const newSet = new Set(selectedPageIds);
    if (newSet.has(pageId)) {
      newSet.delete(pageId);
    } else {
      newSet.add(pageId);
    }
    setSelectedPageIds(newSet);
  };

  const filteredRuns = useMemo(
    () =>
      runs
        .filter((run) => run.status === 'completed')
        .slice(0, 3),
    [runs]
  );

  const comparisonRuns = useMemo(
    () =>
      filteredRuns.map((run: any) => ({
        runId: run.id,
        createdAt: run.runDate.toDate().toISOString(),
        results: run.results?.filter((r: any) => selectedPageIds.has(r.pageId)) || [],
      })),
    [filteredRuns, selectedPageIds]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">Performance Trends</h1>
          <p className="mt-2 text-slate-400">Historical audit data and performance comparisons</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950 p-4 text-red-200">
            <p className="font-semibold">Error loading trends data</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
              <p className="text-slate-400">Loading trends...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* Page Filter */}
            <div className="mb-8 rounded-lg border border-slate-700 bg-slate-900 p-6">
              <h3 className="mb-4 font-semibold text-white">Filter Pages</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {MONITORED_PAGES.map((page) => (
                  <label key={page.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPageIds.has(page.id)}
                      onChange={() => togglePage(page.id)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600"
                    />
                    <span className="text-sm text-slate-300">{page.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Historical Trend Chart */}
            <div className="mb-8">
              <h2 className="mb-6 text-2xl font-bold text-white">Performance Over Time</h2>
              {filteredRuns.length > 0 ? (
                <HistoricalTrend runs={comparisonRuns as any} />
              ) : (
                <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
                  <p className="text-slate-400">No audit runs available</p>
                </div>
              )}
            </div>

            {/* Comparison Table */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-white">Recent Audits Comparison</h2>
              {filteredRuns.length > 0 ? (
                <ComparisonTable runs={comparisonRuns as any} />
              ) : (
                <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
                  <p className="text-slate-400">No audit data to compare</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CWVTrendsPage;
