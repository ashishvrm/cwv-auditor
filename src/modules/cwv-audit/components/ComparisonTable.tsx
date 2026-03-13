import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface AuditResult {
  pageId: string;
  performanceScore: number;
  lcp: number;
  tbt: number;
  cls: number;
}

interface AuditRun {
  runId: string;
  createdAt: string;
  results?: AuditResult[];
}

interface ComparisonTableProps {
  runs: AuditRun[];
}

interface ComparisonData {
  pageId: string;
  [key: string]: string | number | undefined;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ runs }) => {
  const comparisonData = useMemo(() => {
    if (runs.length === 0) return [];

    const allPageIds = new Set<string>();
    runs.forEach((run) => {
      run.results?.forEach((result) => {
        allPageIds.add(result.pageId);
      });
    });

    const data: Record<string, any>[] = [];

    Array.from(allPageIds).forEach((pageId) => {
      const row: ComparisonData = { pageId };

      runs.forEach((run, idx) => {
        const result = run.results?.find((r) => r.pageId === pageId);
        if (result) {
          const suffix = `_run${idx + 1}`;
          row[`performance${suffix}`] = Math.round(result.performanceScore);
          row[`lcp${suffix}`] = Math.round(result.lcp);
          row[`tbt${suffix}`] = Math.round(result.tbt);
          row[`cls${suffix}`] = result.cls.toFixed(2);
        }
      });

      data.push(row);
    });

    return data;
  }, [runs]);

  const getDeltaColor = (delta: number) => {
    if (delta > 0) return 'text-green-400';
    if (delta < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp size={16} className="text-green-400" />;
    if (delta < 0) return <TrendingDown size={16} className="text-red-400" />;
    return null;
  };

  if (comparisonData.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
        <p className="text-slate-400">No comparison data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="py-3 text-left font-medium text-slate-300">Page ID</th>
              {runs.map((_, idx) => (
                <th key={idx} colSpan={4} className="py-3 text-center font-medium text-slate-300">
                  Run {idx + 1}
                </th>
              ))}
            </tr>
            <tr className="border-b border-slate-700">
              <th className="py-3 text-left font-medium text-slate-300">-</th>
              {runs.map((_, idx) => (
                <React.Fragment key={idx}>
                  <th className="py-3 text-center font-medium text-slate-400 text-xs">Perf</th>
                  <th className="py-3 text-center font-medium text-slate-400 text-xs">LCP</th>
                  <th className="py-3 text-center font-medium text-slate-400 text-xs">TBT</th>
                  <th className="py-3 text-center font-medium text-slate-400 text-xs">CLS</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-700 hover:bg-slate-800">
                <td className="py-3 text-slate-300 font-medium">{row.pageId}</td>
                {runs.map((_, runIdx) => {
                  const perfKey = `performance_run${runIdx + 1}`;
                  const lcpKey = `lcp_run${runIdx + 1}`;
                  const tbtKey = `tbt_run${runIdx + 1}`;
                  const clsKey = `cls_run${runIdx + 1}`;

                  const prevRunIdx = runIdx - 1;
                  const prevPerfKey = prevRunIdx >= 0 ? `performance_run${prevRunIdx + 1}` : null;

                  const perfValue = row[perfKey];
                  const perfDelta = prevPerfKey ? (perfValue as number) - (row[prevPerfKey] as number) : null;

                  return (
                    <React.Fragment key={runIdx}>
                      <td className="py-3 text-center text-slate-300">
                        <div className="flex items-center justify-center gap-1">
                          <span>{perfValue}</span>
                          {perfDelta !== null && (
                            <>
                              {getDeltaIcon(perfDelta)}
                              <span className={getDeltaColor(perfDelta)}>
                                {perfDelta > 0 ? '+' : ''}{perfDelta}
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-center text-slate-300">{row[lcpKey]}ms</td>
                      <td className="py-3 text-center text-slate-300">{row[tbtKey]}ms</td>
                      <td className="py-3 text-center text-slate-300">{row[clsKey]}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
