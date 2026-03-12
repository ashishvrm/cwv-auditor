import type { AuditResult, MetricStatus, MonitoredPage } from '../../../types/cwv';
import { getMetricStatus } from './metrics';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface PSIAudit {
  numericValue?: number;
  displayValue?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
}

/**
 * Extract metrics from PSI API response and create AuditResult
 */
export function extractMetrics(
  psiResponse: any,
  page: MonitoredPage,
  auditRunId: string,
  strategy: 'desktop' | 'mobile'
): Omit<AuditResult, 'id'> {
  const audits = psiResponse.lighthouseResult.audits || {};
  const categories = psiResponse.lighthouseResult.categories || {};

  const now = new Date();
  const runDate = Timestamp.now();
  const runMonth = format(now, 'yyyy-MM');

  // Extract performance score (0-100)
  const performanceScore = Math.round((categories.performance?.score || 0) * 100);

  // Extract Core Web Vitals
  const lcp = getAuditNumericValue(audits['largest-contentful-paint']) || 0;
  const tbt = getAuditNumericValue(audits['total-blocking-time']) || 0;
  const cls = getAuditNumericValue(audits['cumulative-layout-shift']) || 0;
  const fcp = getAuditNumericValue(audits['first-contentful-paint']) || 0;
  const si = getAuditNumericValue(audits['speed-index']) || 0;
  const tti = getAuditNumericValue(audits['interactive']) || 0;

  // Calculate metric statuses
  const lcpStatus = getMetricStatus(lcp, 'lcp');
  const tbtStatus = getMetricStatus(tbt, 'tbt');
  const clsStatus = getMetricStatus(cls, 'cls');

  // Calculate overall status
  const overallStatus = getOverallStatus(lcpStatus, tbtStatus, clsStatus);

  // Extract performance metrics
  const serverResponseTime = getAuditNumericValue(audits['server-response-time']) || 0;
  const totalByteWeight = getAuditNumericValue(audits['total-byte-weight']) || 0;
  const mainThreadWorkMs = getAuditNumericValue(audits['mainthread-work-breakdown']) || 0;

  // Extract resource summary
  const resources = extractResourceSummary(audits['resource-summary']);

  // Extract optimization opportunities
  const unusedJavascriptBytes = getAuditDetails(audits['unused-javascript'])?.overallSavingsBytes || 0;
  const unusedCssBytes = getAuditDetails(audits['unused-css-rules'])?.overallSavingsBytes || 0;
  const renderBlockingSavingsMs = getAuditDetails(audits['render-blocking-resources'])?.overallSavingsMs || 0;

  // Extract long tasks
  const { longTaskCount, longestTaskMs } = extractLongTasks(audits['long-tasks']);

  // Extract LCP element
  const lcpElement = extractLCPElement(audits);

  // Extract LCP breakdown
  const lcpBreakdown = extractLCPBreakdown(audits);

  // Extract CLS culprits
  const clsCulprits = extractCLSCulprits(audits);

  // Extract render blocking resources
  const renderBlockingResources = extractRenderBlockingResources(audits['render-blocking-resources']);

  // Extract font issues
  const fontIssues = extractFontIssues(audits);

  // Extract HTTP protocol
  const httpProtocol = extractHTTPProtocol(audits, psiResponse);

  // Count network requests
  const totalRequestCount = getAuditDetails(audits['network-requests'])?.items?.length || 0;

  // Store raw audit data
  const rawLighthouseCategories = categories;
  const rawLighthouseAuditKeys = Object.keys(audits);

  return {
    auditRunId,
    runDate,
    runMonth,
    pageId: page.id,
    pageUrl: page.url,
    pageName: page.name,
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
    createdAt: Timestamp.now(),
  };
}

/**
 * Get numeric value from audit
 */
function getAuditNumericValue(audit: PSIAudit | undefined): number {
  if (!audit) return 0;
  return audit.numericValue || 0;
}

/**
 * Get details from audit
 */
function getAuditDetails(audit: PSIAudit | undefined): any {
  if (!audit) return null;
  return audit.details || null;
}

/**
 * Extract resource summary from audit details
 */
function extractResourceSummary(audit: PSIAudit | undefined) {
  const defaultResources = {
    scripts: { count: 0, bytes: 0 },
    images: { count: 0, bytes: 0 },
    fonts: { count: 0, bytes: 0 },
    stylesheets: { count: 0, bytes: 0 },
    documents: { count: 0, bytes: 0 },
    thirdParty: { count: 0, bytes: 0 },
    other: { count: 0, bytes: 0 },
  };

  if (!audit?.details?.items) {
    return defaultResources;
  }

  const items = audit.details.items || [];

  items.forEach((item: any) => {
    const type = item.resourceType?.toLowerCase() || '';
    const bytes = item.size || 0;
    const count = 1;

    switch (type) {
      case 'script':
        defaultResources.scripts.count += count;
        defaultResources.scripts.bytes += bytes;
        break;
      case 'image':
        defaultResources.images.count += count;
        defaultResources.images.bytes += bytes;
        break;
      case 'font':
        defaultResources.fonts.count += count;
        defaultResources.fonts.bytes += bytes;
        break;
      case 'stylesheet':
        defaultResources.stylesheets.count += count;
        defaultResources.stylesheets.bytes += bytes;
        break;
      case 'document':
        defaultResources.documents.count += count;
        defaultResources.documents.bytes += bytes;
        break;
      case 'third-party':
        defaultResources.thirdParty.count += count;
        defaultResources.thirdParty.bytes += bytes;
        break;
      default:
        defaultResources.other.count += count;
        defaultResources.other.bytes += bytes;
    }
  });

  return defaultResources;
}

/**
 * Extract long tasks information
 */
function extractLongTasks(audit: PSIAudit | undefined): { longTaskCount: number; longestTaskMs: number } {
  if (!audit?.details?.items) {
    return { longTaskCount: 0, longestTaskMs: 0 };
  }

  const items = audit.details.items || [];
  let longestTaskMs = 0;

  items.forEach((item: any) => {
    const duration = item.duration || 0;
    if (duration > longestTaskMs) {
      longestTaskMs = duration;
    }
  });

  return {
    longTaskCount: items.length,
    longestTaskMs,
  };
}

/**
 * Extract LCP element information
 */
function extractLCPElement(audits: Record<string, PSIAudit>) {
  // Try new-style audit key first
  let lcpData = audits['lcp-breakdown-insight'];

  if (!lcpData) {
    lcpData = audits['largest-contentful-paint-element'];
  }

  if (!lcpData?.details?.items?.[0]) {
    return null;
  }

  const item = lcpData.details.items[0];

  return {
    selector: item.selector || item.tagName || '',
    snippet: item.snippet || '',
    nodeLabel: item.nodeLabel || item.tagName || '',
  };
}

/**
 * Extract LCP breakdown timing
 */
function extractLCPBreakdown(audits: Record<string, PSIAudit>) {
  const lcpBreakdownAudit = audits['lcp-breakdown-insight'] || audits['largest-contentful-paint'];

  if (!lcpBreakdownAudit?.details?.items?.[0]) {
    return null;
  }

  const item = lcpBreakdownAudit.details.items[0];

  return {
    ttfb: item.timeToFirstByte || 0,
    resourceLoadDelay: item.resourceLoadDelay || 0,
    resourceLoadDuration: item.resourceLoadDuration || 0,
    elementRenderDelay: item.elementRenderDelay || 0,
  };
}

/**
 * Extract CLS culprits
 */
function extractCLSCulprits(audits: Record<string, PSIAudit>) {
  const clsCulpritsAudit = audits['cls-culprits-insight'] || audits['layout-shift-elements'];

  if (!clsCulpritsAudit?.details?.items) {
    return [];
  }

  return clsCulpritsAudit.details.items.map((item: any) => ({
    selector: item.selector || '',
    score: item.score || item.cumulativeLayoutShiftValue || 0,
    cause: item.cause || item.reason || '',
  }));
}

/**
 * Extract render blocking resources
 */
function extractRenderBlockingResources(audit: PSIAudit | undefined) {
  if (!audit?.details?.items) {
    return [];
  }

  return audit.details.items.map((item: any) => ({
    url: item.url || '',
    totalBytes: item.totalBytes || item.size || 0,
    wastedMs: item.wastedMs || 0,
  }));
}

/**
 * Extract font-related issues
 */
function extractFontIssues(audits: Record<string, PSIAudit>) {
  const fontAudit = audits['font-display-insight'] || audits['font-display'];

  if (!fontAudit?.details?.items) {
    return [];
  }

  return fontAudit.details.items.map((item: any) => ({
    url: item.url || '',
    wastedMs: item.wastedMs || 0,
  }));
}

/**
 * Extract HTTP protocol version
 */
function extractHTTPProtocol(audits: Record<string, PSIAudit>, psiResponse: any): string {
  // Try to get HTTP/2 status from audits
  const http2Audit = audits['uses-http2'];

  if (http2Audit?.details?.items) {
    // If there are items that pass (HTTP/2), return HTTP/2
    const items = http2Audit.details.items || [];
    const http2Items = items.filter((item: any) => item.protocol?.includes('h2'));

    if (http2Items.length > 0) {
      return 'HTTP/2';
    }
  }

  // Try to extract from response headers in PSI response
  if (psiResponse?.lighthouseResult?.audits?.['network-requests']?.details?.items) {
    const items = psiResponse.lighthouseResult.audits['network-requests'].details.items;
    const mainDoc = items.find((item: any) => item.resourceType === 'document');

    if (mainDoc?.protocol) {
      return mainDoc.protocol;
    }
  }

  return 'HTTP/1.1'; // Default fallback
}

/**
 * Get overall status from individual metric statuses
 */
function getOverallStatus(
  lcpStatus: MetricStatus,
  tbtStatus: MetricStatus,
  clsStatus: MetricStatus
): MetricStatus {
  if (lcpStatus === 'poor' || tbtStatus === 'poor' || clsStatus === 'poor') {
    return 'poor';
  }

  if (lcpStatus === 'needs-improvement' || tbtStatus === 'needs-improvement' || clsStatus === 'needs-improvement') {
    return 'needs-improvement';
  }

  return 'good';
}
