import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLatestAudit } from '../hooks/useLatestAudit';
import { usePageHistory } from '../hooks/usePageHistory';
import { MONITORED_PAGES } from '../constants/pages';
import PageDetailCard from '../components/PageDetailCard';
import HistoricalChart from '../components/HistoricalChart';
import { ArrowLeft, Download } from 'lucide-react';
import { exportToCSV } from '../utils/export';

const CWVPageDetailPage: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const { results, loading: auditLoading } = useLatestAudit();
  const { history, loading: historyLoading } = usePageHistory(pageId || '');

  const page = useMemo(
    () => MONITORED_PAGES.find((p) => p.id === pageId),
    [pageId]
  );

  const currentMetrics = useMemo(
    () => results?.find((r: any) => r.pageId === pageId),
    [results, pageId]
  );

  const transformedHistory = useMemo(
    () => history.map((r: any) => ({
      timestamp: r.runDate.toDate().toISOString(),
      performance: r.performanceScore,
      lcp: r.lcp,
      tbt: r.tbt,
      cls: r.cls,
      fcp: r.fcp,
      si: r.si,
      tti: r.tti,
    })),
    [history]
  );

  const handleExport = () => {
    if (currentMetrics) {
      const data = [
        {
          pageId: currentMetrics.pageId,
          timestamp: currentMetrics.runDate.toDate().toISOString(),
          performance: currentMetrics.performanceScore,
          lcp: currentMetrics.lcp,
          tbt: currentMetrics.tbt,
          cls: currentMetrics.cls,
          fcp: currentMetrics.fcp,
          si: currentMetrics.si,
          tti: currentMetrics.tti,
          totalByteWeight: currentMetrics.totalByteWeight,
        },
      ];
      exportToCSV(data, `${pageId}-metrics.csv`);
    }
  };

  const metricsForCard = currentMetrics ? {
    pageId: currentMetrics.pageId,
    url: currentMetrics.pageUrl,
    timestamp: currentMetrics.runDate.toDate().toISOString(),
    performanceScore: currentMetrics.performanceScore,
    lcp: currentMetrics.lcp,
    tbt: currentMetrics.tbt,
    cls: currentMetrics.cls,
    fcp: currentMetrics.fcp,
    si: currentMetrics.si,
    tti: currentMetrics.tti,
    serverResponseTime: currentMetrics.serverResponseTime,
    networkRequests: currentMetrics.totalRequestCount,
    pageWeight: currentMetrics.totalByteWeight,
    unusedJs: currentMetrics.unusedJavascriptBytes,
    unusedCss: currentMetrics.unusedCssBytes,
  } : null;

  if (!page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
        <div className="mx-auto max-w-7xl">
          <button
            onClick={() => navigate('/cwv-audit/pages')}
            className="mb-6 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft size={20} />
            Back to Pages
          </button>
          <p className="text-red-400">Page not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <button
          onClick={() => navigate('/cwv-audit/pages')}
          className="mb-6 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Pages
        </button>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">{page.name}</h1>
            <p className="mt-2 text-slate-400">{page.url}</p>
          </div>
          {currentMetrics && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Download size={18} />
              Export CSV
            </button>
          )}
        </div>

        {/* Current Metrics */}
        {auditLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
              <p className="text-slate-400">Loading metrics...</p>
            </div>
          </div>
        ) : metricsForCard ? (
          <div className="mb-8">
            <PageDetailCard metrics={metricsForCard} />
          </div>
        ) : (
          <div className="mb-8 rounded-lg border border-slate-700 bg-slate-900 p-6">
            <p className="text-slate-400">No metrics available for this page</p>
          </div>
        )}

        {/* Historical Chart */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-white">Historical Trends</h2>
          {historyLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500 mx-auto"></div>
                <p className="text-slate-400">Loading history...</p>
              </div>
            </div>
          ) : history && history.length > 0 ? (
            <HistoricalChart data={transformedHistory} />
          ) : (
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
              <p className="text-slate-400">No historical data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CWVPageDetailPage;
