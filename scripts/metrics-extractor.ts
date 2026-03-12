interface ResourceItem {
  resourceType: string;
  requestCount?: number;
  transferSize?: number;
  resourceSize?: number;
}

export interface ExtractedMetrics {
  performance: { score: number };
  lcp: number;
  tbt: number;
  cls: number;
  fcp: number;
  si: number;
  tti: number;
  serverResponseTime: number;
  resourceSummary: ResourceItem[];
  unusedJs: number;
  unusedCss: number;
  renderBlocking: any;
  longTasks: any;
  mainThreadWork: number;
  lcpElement: string;
  clsCulprits: any[];
  fontIssues: any;
  networkRequests: number;
  totalByteWeight: number;
  httpProtocol: string;
  pageWeight: number;
  timestamp: string;
}

export function extractMetrics(psiResponse: any): ExtractedMetrics {
  const lr = psiResponse.lighthouseResult || {};
  const audits = lr.audits || {};

  // Performance score
  const performanceScore = (lr.categories?.performance?.score || 0) * 100;

  // Core Web Vitals
  const lcp = audits['largest-contentful-paint']?.numericValue || 0;
  const tbt = audits['total-blocking-time']?.numericValue || 0;
  const cls = audits['cumulative-layout-shift']?.numericValue || 0;

  // Additional metrics
  const fcp = audits['first-contentful-paint']?.numericValue || 0;
  const si = audits['speed-index']?.numericValue || 0;
  const tti = audits['interactive']?.numericValue || 0;
  const serverResponseTime = audits['server-response-time']?.numericValue || 0;

  // Resource summary
  const resourceSummary = audits['resource-summary']?.details?.items || [];

  // Optimization opportunities
  const unusedJs = audits['unused-javascript']?.details?.overallSavingsBytes || 0;
  const unusedCss = audits['unused-css-rules']?.details?.overallSavingsBytes || 0;

  // Render blocking
  const renderBlocking = audits['render-blocking-resources'] || null;

  // Long tasks
  const longTasks = audits['long-tasks'] || null;

  // Main thread work
  const mainThreadWork = audits['mainthread-work-breakdown']?.numericValue || 0;

  // LCP element (handle both old and new style)
  const lcpElementAudit =
    audits['largest-contentful-paint-element'] || audits['lcp-breakdown-insight'];
  const lcpElement = lcpElementAudit?.details?.items?.[0]?.node?.snippet || 'Unknown';

  // CLS culprits (handle both old and new style)
  const clsAudit = audits['layout-shift-elements'] || audits['cls-culprits-insight'];
  const clsCulprits = clsAudit?.details?.items || [];

  // Font issues
  const fontIssues = audits['font-display'] || audits['font-display-insight'] || null;

  // Network information
  const networkRequests = resourceSummary.reduce(
    (sum: number, item: ResourceItem) => sum + (item.requestCount || 0),
    0
  );

  const totalByteWeight = resourceSummary.reduce(
    (sum: number, item: ResourceItem) => sum + (item.transferSize || 0),
    0
  );

  // HTTP protocol detection
  let httpProtocol = 'HTTP/1.1';
  const performanceLog = lr.configSettings?.emulatedFormFactor || 'desktop';
  // Note: PSI doesn't directly expose protocol, defaulting to HTTP/1.1
  // This could be enhanced with additional data if available

  return {
    performance: { score: performanceScore },
    lcp,
    tbt,
    cls,
    fcp,
    si,
    tti,
    serverResponseTime,
    resourceSummary,
    unusedJs,
    unusedCss,
    renderBlocking,
    longTasks,
    mainThreadWork,
    lcpElement,
    clsCulprits,
    fontIssues,
    networkRequests,
    totalByteWeight,
    httpProtocol,
    pageWeight: totalByteWeight,
    timestamp: new Date().toISOString(),
  };
}
