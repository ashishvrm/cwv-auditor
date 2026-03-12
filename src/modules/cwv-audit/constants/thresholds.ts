import type { CWVThresholds, MetricStatus } from '../../../types/cwv';

export const CWV_THRESHOLDS: CWVThresholds = {
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
    good: 3000,
    poor: 5000,
  },
  si: {
    good: 2500,
    poor: 4500,
  },
};

export function getMetricStatus(metric: string, value: number): MetricStatus {
  const metricKey = metric.toLowerCase() as keyof CWVThresholds;
  const threshold = CWV_THRESHOLDS[metricKey];

  if (!threshold) {
    return 'poor';
  }

  if (value <= threshold.good) {
    return 'good';
  }

  if (value <= threshold.poor) {
    return 'needs-improvement';
  }

  return 'poor';
}

export function getStatusColor(status: MetricStatus): string {
  switch (status) {
    case 'good':
      return '#22c55e'; // green-500
    case 'needs-improvement':
      return '#f59e0b'; // amber-500
    case 'poor':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

export function getStatusLabel(status: MetricStatus): string {
  switch (status) {
    case 'good':
      return 'Good';
    case 'needs-improvement':
      return 'Needs Improvement';
    case 'poor':
      return 'Poor';
    default:
      return 'Unknown';
  }
}

export function getStatusTailwindClass(status: MetricStatus): string {
  switch (status) {
    case 'good':
      return 'bg-success-50 text-success-900 border-success-200';
    case 'needs-improvement':
      return 'bg-warning-50 text-warning-900 border-warning-200';
    case 'poor':
      return 'bg-critical-50 text-critical-900 border-critical-200';
    default:
      return 'bg-gray-50 text-gray-900 border-gray-200';
  }
}

export function getStatusBadgeTailwindClass(status: MetricStatus): string {
  switch (status) {
    case 'good':
      return 'bg-success-100 text-success-800';
    case 'needs-improvement':
      return 'bg-warning-100 text-warning-800';
    case 'poor':
      return 'bg-critical-100 text-critical-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
