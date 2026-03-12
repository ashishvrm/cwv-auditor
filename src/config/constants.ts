export const APP_NAME = 'CWV Auditor Portal';
export const APP_DESCRIPTION = 'Comprehensive Core Web Vitals auditing and monitoring platform';

// Google's CWV thresholds (good/needsImprovement/poor)
export const CWV_THRESHOLDS = {
  LCP: {
    good: 2500,
    needsImprovement: 4000,
  },
  FID: {
    good: 100,
    needsImprovement: 300,
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
  },
  FCP: {
    good: 1800,
    needsImprovement: 3000,
  },
  TTFB: {
    good: 600,
    needsImprovement: 1800,
  },
} as const;

// Metric names
export const METRIC_NAMES = {
  LCP: 'Largest Contentful Paint',
  FID: 'First Input Delay',
  CLS: 'Cumulative Layout Shift',
  FCP: 'First Contentful Paint',
  TTFB: 'Time to First Byte',
} as const;

// Common error messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You are not authorized to access this resource',
  NOT_FOUND: 'The requested resource was not found',
  INVALID_PARAMS: 'Invalid parameters provided',
  FIREBASE_ERROR: 'An error occurred with the database',
  AUDIT_FAILED: 'Failed to run the audit. Please try again.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  AUDIT_CREATED: 'Audit started successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
} as const;
