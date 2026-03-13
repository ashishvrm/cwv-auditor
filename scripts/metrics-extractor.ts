import { AuditResult } from './firestore-writer';
import admin from 'firebase-admin';

interface ResourceItem {
  resourceType: string;
  requestCount?: number;
  transferSize?: number;
  resourceSize?: number;
}

interface PSIAudit {
  numericValue?: number;
  details?: {
    items?: any[];
    overallSavingsBytes?: number;
  };
}

export function extractMetrics(
  psiResponse: any,
  pageId: string,
  pageUrl: string,
  pageName: string,
  auditRunId: string,
  strategy: 'desktop' | 'mobile',
  now: Date
): Omit<AuditResult, 'id' | 'createdAt'> {
  const lr = psiResponse.lighthouseResult || {};
  const audits = lr.audits || {};

  const runMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Performance score (0-100)
  const performanceScore = Math.round((lr.categories?.performance?.score || 0) * 100);

  // Core Web Vitals metrics
  const lcp = audits['largest-contentful-paint']?.numericValue || 0;
  const tbt = audits['total-blocking-time']?.numericValue || 0;
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;

  // Additional metrics
  const fcp = audits['first-contentful-paint']?.numericValue || 0;
  const si = audits['speed-index']?.numericValue || 0;
  const tti = audits['interactive']?.numericValue || 0;
  const serverResponseTime = audits['server-response-time']?.numericValue || 0;

  // Resource summary
  const resourceSummary: ResourceItem[] = audits['resource-summary']?.details?.items || [];

  // Compute status for metrics
  const lcpStatus = getMetricStatus(lcp, 2500, 4000);
  const tbtStatus = getMetricStatus(tbt, 200, 600);
  const clsStatus = getMetricStatus(cls, 0.1, 0.25);

  // Overall status: poor if any core metric is poor, good if all are good, else needs-improvement
  const overallStatus = computeOverallStatus(lcpStatus, tbtStatus, clsStatus);

  // Optimization opportunities
  const unusedJavascriptBytes = audits['unused-javascript']?.details?.overallSavingsBytes || 0;
  const unusedCssBytes = audits['unused-css-rules']?.details?.overallSavingsBytes || 0;

  // Render blocking resources (handle both old and new style)
  const renderBlockingAudit = audits['render-blocking-resources'] || audits['render-blocking-insight'];
  const renderBlockingItems = renderBlockingAudit?.details?.items || [];
  const renderBlockingResources = renderBlockingItems.map((item: any) => ({
    url: item.url || '',
    totalBytes: item.totalBytes || 0,
    wastedMs: item.wastedMs || 0,
  }));
  const renderBlockingSavingsMs = renderBlockingAudit?.details?.overallSavingsMs || 0;

  // Long tasks
  const longTasksAudit = audits['long-tasks'];
  const longTaskItems = longTasksAudit?.details?.items || [];
  const longTaskCount = longTaskItems.length;
  const longestTaskMs = longTaskItems.length > 0
    ? Math.max(...longTaskItems.map((item: any) => item.duration || 0))
    : 0;

  // Main thread work
  const mainThreadWorkMs = audits['mainthread-work-breakdown']?.numericValue || 0;

  // LCP element (handle both old and new style)
  const lcpElementAudit = audits['largest-contentful-paint-element'] || audits['lcp-breakdown-insight'];
  const lcpElementItem = lcpElementAudit?.details?.items?.[0];
  const lcpElement = lcpElementItem
    ? {
        selector: lcpElementItem.node?.selector || '',
        snippet: lcpElementItem.node?.snippet || '',
        nodeLabel: lcpElementItem.node?.nodeLabel || '',
      }
    : null;

  // LCP Breakdown phases (handle both old and new style)
  const lcpBreakdownAudit = audits['lcp-breakdown-insight'] || audits['largest-contentful-paint-element'];
  const lcpBreakdownItems = lcpBreakdownAudit?.details?.items || [];
  const lcpBreakdown = lcpBreakdownItems.length > 0
    ? {
        ttfb: lcpBreakdownItems[0].timeToFirstByte || 0,
        resourceLoadDelay: lcpBreakdownItems[0].resourceLoadDelay || 0,
        resourceLoadDuration: lcpBreakdownItems[0].resourceLoadDuration || 0,
        elementRenderDelay: lcpBreakdownItems[0].elementRenderDelay || 0,
      }
    : null;

  // CLS culprits (handle both old and new style)
  const clsAudit = audits['layout-shift-elements'] || audits['cls-culprits-insight'];
  const clsItems = clsAudit?.details?.items || [];
  const clsCulprits = clsItems.map((item: any) => ({
    selector: item.node?.selector || '',
    score: item.cumulativeLayoutShiftValue || 0,
    cause: item.cause || '',
  }));

  // Font issues (handle both old and new style)
  const fontAudit = audits['font-display'] || audits['font-display-insight'];
  const fontItems = fontAudit?.details?.items || [];
  const fontIssues = fontItems.map((item: any) => ({
    url: item.url || '',
    wastedMs: item.wastedMs || 0,
  }));

  // Network information
  const totalRequestCount = resourceSummary.reduce(
    (sum: number, item: ResourceItem) => sum + (item.requestCount || 0),
    0
  );

  const totalByteWeight = resourceSummary.reduce(
    (sum: number, item: ResourceItem) => sum + (item.transferSize || 0),
    0
  );

  // Parse resources by type
  const resources = parseResourceSummary(resourceSummary);

  // HTTP protocol detection
  const httpProtocol = 'HTTP/1.1'; // PSI doesn't directly expose protocol

  // Collect raw Lighthouse categories and audit keys
  const rawLighthouseCategories = lr.categories || {};
  const rawLighthouseAuditKeys = Object.keys(audits);

  return {
    auditRunId,
    runDate: admin.firestore.Timestamp.now(),
    runMonth,
    pageId,
    pageUrl,
    pageName,
    strategy,
    performanceScore,
    lcp,
    tbt,
    cls,
    fcp,
    si,
    tti,
    lcpStatus,
    tbtStatus,
    clsStatus,
    overallStatus,
    serverResponseTime,
    totalRequestCount,
    totalByteWeight,
    resources,
    unusedJavascriptBytes,
    unusedCssBytes,
    renderBlockingSavingsMs,
    longTaskCount,
    longestTaskMs,
    mainThreadWorkMs,
    lcpElement,
    lcpBreakdown,
    clsCulprits,
    renderBlockingResources,
    fontIssues,
    httpProtocol,
    rawLighthouseCategories,
    rawLighthouseAuditKeys,
  };
}

function getMetricStatus(
  value: number,
  goodThreshold: number,
  poorThreshold: number
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= goodThreshold) {
    return 'good';
  }
  if (value >= poorThreshold) {
    return 'poor';
  }
  return 'needs-improvement';
}

function computeOverallStatus(
  lcpStatus: string,
  tbtStatus: string,
  clsStatus: string
): 'good' | 'needs-improvement' | 'poor' {
  if (lcpStatus === 'poor' || tbtStatus === 'poor' || clsStatus === 'poor') {
    return 'poor';
  }
  if (lcpStatus === 'good' && tbtStatus === 'good' && clsStatus === 'good') {
    return 'good';
  }
  return 'needs-improvement';
}

function parseResourceSummary(items: ResourceItem[]): {
  scripts: { count: number; bytes: number };
  images: { count: number; bytes: number };
  fonts: { count: number; bytes: number };
  stylesheets: { count: number; bytes: number };
  documents: { count: number; bytes: number };
  thirdParty: { count: number; bytes: number };
  other: { count: number; bytes: number };
} {
  const resources = {
    scripts: { count: 0, bytes: 0 },
    images: { count: 0, bytes: 0 },
    fonts: { count: 0, bytes: 0 },
    stylesheets: { count: 0, bytes: 0 },
    documents: { count: 0, bytes: 0 },
    thirdParty: { count: 0, bytes: 0 },
    other: { count: 0, bytes: 0 },
  };

  for (const item of items) {
    const type = item.resourceType ? item.resourceType.toLowerCase() : 'other';
    const count = item.requestCount || 0;
    const bytes = item.transferSize || 0;

    if (type.includes('script')) {
      resources.scripts.count += count;
      resources.scripts.bytes += bytes;
    } else if (type.includes('image')) {
      resources.images.count += count;
      resources.images.bytes += bytes;
    } else if (type.includes('font')) {
      resources.fonts.count += count;
      resources.fonts.bytes += bytes;
    } else if (type.includes('stylesheet')) {
      resources.stylesheets.count += count;
      resources.stylesheets.bytes += bytes;
    } else if (type.includes('document')) {
      resources.documents.count += count;
      resources.documents.bytes += bytes;
    } else if (type.includes('third-party')) {
      resources.thirdParty.count += count;
      resources.thirdParty.bytes += bytes;
    } else {
      resources.other.count += count;
      resources.other.bytes += bytes;
    }
  }

  return resources;
}
