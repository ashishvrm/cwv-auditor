import type { AuditResult, AuditRun } from '../../../types/cwv';
import { getStatusColor } from './metrics';

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

/**
 * Transform audit results into bar chart data (one bar per page)
 */
export function toBarChartData(results: AuditResult[], metric: string): ChartDataPoint[] {
  const metricKey = metric.toLowerCase();

  return results.map((result) => {
    let value: number = 0;

    switch (metricKey) {
      case 'lcp':
        value = result.lcp;
        break;
      case 'tbt':
        value = result.tbt;
        break;
      case 'cls':
        value = result.cls;
        break;
      case 'fcp':
        value = result.fcp;
        break;
      case 'tti':
        value = result.tti;
        break;
      case 'si':
        value = result.si;
        break;
      case 'performancescore':
        value = result.performanceScore;
        break;
      case 'serverresponsetime':
        value = result.serverResponseTime;
        break;
      case 'totalbyteweight':
        value = result.totalByteWeight;
        break;
      default:
        value = 0;
    }

    let status = 'good';
    switch (metricKey) {
      case 'lcp':
        status = result.lcpStatus;
        break;
      case 'tbt':
        status = result.tbtStatus;
        break;
      case 'cls':
        status = result.clsStatus;
        break;
      default:
        status = result.overallStatus;
    }

    return {
      name: result.pageName,
      shortName: result.pageName.substring(0, 10),
      [metric]: value,
      status: getStatusColor(status as any),
    };
  });
}

/**
 * Transform audit runs into line chart data for trends
 */
export function toTrendLineData(runs: AuditRun[], metric: string): ChartDataPoint[] {
  const metricKey = metric.toLowerCase();

  return runs.map((run) => {
    let value: number = 0;

    switch (metricKey) {
      case 'lcp':
        value = run.avgLCP;
        break;
      case 'tbt':
        value = run.avgTBT;
        break;
      case 'cls':
        value = run.avgCLS;
        break;
      case 'fcp':
        value = run.avgFCP;
        break;
      case 'tti':
        value = run.avgTTI;
        break;
      case 'performancescore':
        value = run.avgPerformanceScore;
        break;
      default:
        value = 0;
    }

    // Format date for display
    const date = new Date(run.runDate.seconds * 1000);
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    return {
      name: monthName,
      runDate: run.runDate.seconds,
      [metric]: value,
    };
  });
}

/**
 * Transform results for stacked bar chart (resource breakdown)
 */
export function toResourceBreakdownData(results: AuditResult[]): ChartDataPoint[] {
  return results.map((result) => ({
    name: result.pageName,
    shortName: result.pageName.substring(0, 10),
    scripts: result.resources.scripts.bytes,
    images: result.resources.images.bytes,
    fonts: result.resources.fonts.bytes,
    stylesheets: result.resources.stylesheets.bytes,
  }));
}

/**
 * Transform for comparison table
 */
export function toComparisonData(
  runs: AuditRun[]
): { metric: string; values: { month: string; value: number; delta?: number }[] }[] {
  const metrics = [
    { key: 'avgLCP', label: 'LCP' },
    { key: 'avgTBT', label: 'TBT' },
    { key: 'avgCLS', label: 'CLS' },
    { key: 'avgFCP', label: 'FCP' },
    { key: 'avgTTI', label: 'TTI' },
    { key: 'avgPerformanceScore', label: 'Performance Score' },
  ];

  return metrics.map((metric) => {
    const values = runs.map((run, index) => {
      const value = run[metric.key as keyof AuditRun] as number;
      const prevValue = index > 0 ? (runs[index - 1][metric.key as keyof AuditRun] as number) : null;

      const date = new Date(run.runDate.seconds * 1000);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      return {
        month: monthName,
        value,
        delta: prevValue !== null ? value - prevValue : undefined,
      };
    });

    return {
      metric: metric.label,
      values,
    };
  });
}
