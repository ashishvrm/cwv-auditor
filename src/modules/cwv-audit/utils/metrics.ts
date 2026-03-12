import type { MetricStatus, CWVThresholds } from '../../../types/cwv';

/**
 * Default thresholds matching Google's Core Web Vitals standards
 */
export const DEFAULT_THRESHOLDS: CWVThresholds = {
  lcp: { good: 2500, poor: 4000 },
  tbt: { good: 200, poor: 600 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  tti: { good: 3800, poor: 7300 },
  si: { good: 3400, poor: 5800 },
};

/**
 * Get the status of a metric value
 */
export function getMetricStatus(
  value: number,
  metric: keyof CWVThresholds,
  thresholds: CWVThresholds = DEFAULT_THRESHOLDS
): MetricStatus {
  const threshold = thresholds[metric];

  if (value <= threshold.good) {
    return 'good';
  }

  if (value > threshold.poor) {
    return 'poor';
  }

  return 'needs-improvement';
}

/**
 * Get color for metric status
 */
export function getStatusColor(status: MetricStatus): string {
  switch (status) {
    case 'good':
      return '#10b981'; // emerald-500
    case 'needs-improvement':
      return '#f59e0b'; // amber-500
    case 'poor':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

/**
 * Get Tailwind background class for metric status
 */
export function getStatusBgClass(status: MetricStatus): string {
  switch (status) {
    case 'good':
      return 'bg-emerald-100';
    case 'needs-improvement':
      return 'bg-amber-100';
    case 'poor':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
}

/**
 * Get Tailwind text class for metric status
 */
export function getStatusTextClass(status: MetricStatus): string {
  switch (status) {
    case 'good':
      return 'text-emerald-900';
    case 'needs-improvement':
      return 'text-amber-900';
    case 'poor':
      return 'text-red-900';
    default:
      return 'text-gray-900';
  }
}

/**
 * Format a metric value based on metric type
 */
export function formatMetricValue(value: number, metric: string): string {
  const lowerMetric = metric.toLowerCase();

  // Time-based metrics (in milliseconds) - convert to seconds
  if (['lcp', 'fcp', 'tti', 'si', 'tbt', 'ttfb', 'serverresponsetime', 'mainthread'].includes(lowerMetric)) {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}s`;
    }
    return `${Math.round(value)}ms`;
  }

  // CLS - cumulative layout shift (unitless decimal)
  if (lowerMetric === 'cls') {
    return value.toFixed(2);
  }

  // Performance score (0-100)
  if (lowerMetric.includes('score')) {
    return `${Math.round(value)}`;
  }

  // Default: format as is
  return value.toFixed(2);
}

/**
 * Format bytes to human-readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format milliseconds to human-readable format
 */
export function formatMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  return `${Math.round(ms)}ms`;
}

/**
 * Get color for a performance score (0-100)
 */
export function getScoreColor(score: number): string {
  if (score >= 90) {
    return '#10b981'; // green
  }

  if (score >= 50) {
    return '#f59e0b'; // yellow
  }

  return '#ef4444'; // red
}

/**
 * Get overall audit status based on individual metric statuses
 */
export function getOverallStatus(
  lcpStatus: MetricStatus,
  tbtStatus: MetricStatus,
  clsStatus: MetricStatus
): MetricStatus {
  // If any metric is poor, overall is poor
  if (lcpStatus === 'poor' || tbtStatus === 'poor' || clsStatus === 'poor') {
    return 'poor';
  }

  // If any metric needs improvement, overall needs improvement
  if (
    lcpStatus === 'needs-improvement' ||
    tbtStatus === 'needs-improvement' ||
    clsStatus === 'needs-improvement'
  ) {
    return 'needs-improvement';
  }

  // All metrics are good
  return 'good';
}

/**
 * Get Tailwind color class for status (dark theme)
 */
export function getStatusColorTailwind(status: MetricStatus): string {
  switch (status) {
    case 'good':
      return 'text-emerald-400';
    case 'needs-improvement':
      return 'text-amber-400';
    case 'poor':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get Tailwind background color class for status (dark theme)
 */
export function getStatusBgColorTailwind(status: MetricStatus): string {
  switch (status) {
    case 'good':
      return 'bg-emerald-500';
    case 'needs-improvement':
      return 'bg-amber-500';
    case 'poor':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Get status of a metric value using good/poor thresholds
 */
export function getMetricStatusWithThresholds(
  value: number,
  goodThreshold: number,
  poorThreshold: number
): MetricStatus {
  if (value <= goodThreshold) {
    return 'good';
  } else if (value <= poorThreshold) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

/**
 * Get score status (for 0-100 performance scores)
 */
export function getScoreStatus(score: number): MetricStatus {
  if (score >= 90) {
    return 'good';
  } else if (score >= 50) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}

/**
 * Thresholds constant for easy reference
 */
export const THRESHOLDS = {
  lcp: {
    good: 2500,
    poor: 4000,
  },
  tbt: {
    good: 200,
    poor: 600,
  },
  cls: {
    good: 0.1,
    poor: 0.25,
  },
  fcp: {
    good: 1800,
    poor: 3000,
  },
  tti: {
    good: 3800,
    poor: 7300,
  },
  si: {
    good: 3400,
    poor: 5800,
  },
};
