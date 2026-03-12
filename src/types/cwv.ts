import { Timestamp } from 'firebase/firestore';

export type MetricStatus = 'good' | 'needs-improvement' | 'poor';
export type AuditStrategy = 'desktop' | 'mobile';
export type AuditTrigger = 'scheduled' | 'manual';
export type AuditStatus = 'completed' | 'failed' | 'running';

export interface MonitoredPage {
  id: string;
  url: string;
  name: string;
  shortName: string;
  template: string;
}

export interface ResourceMetrics {
  count: number;
  bytes: number;
}

export interface Resources {
  scripts: ResourceMetrics;
  images: ResourceMetrics;
  fonts: ResourceMetrics;
  stylesheets: ResourceMetrics;
  documents: ResourceMetrics;
  thirdParty: ResourceMetrics;
  other: ResourceMetrics;
}

export interface LCPElement {
  selector: string;
  snippet: string;
  nodeLabel: string;
}

export interface LCPBreakdown {
  ttfb: number;
  resourceLoadDelay: number;
  resourceLoadDuration: number;
  elementRenderDelay: number;
}

export interface CLSCulprit {
  selector: string;
  score: number;
  cause: string;
}

export interface RenderBlockingResource {
  url: string;
  totalBytes: number;
  wastedMs: number;
}

export interface FontIssue {
  url: string;
  wastedMs: number;
}

export interface AuditRun {
  id: string;
  runDate: Timestamp;
  runMonth: string;
  strategy: AuditStrategy;
  triggeredBy: AuditTrigger;
  triggeredByUser: string | null;
  status: AuditStatus;
  pagesAudited: number;
  avgPerformanceScore: number;
  avgLCP: number;
  avgTBT: number;
  avgCLS: number;
  avgFCP: number;
  avgTTI: number;
  summary: {
    good: number;
    needsImprovement: number;
    poor: number;
  };
  createdAt: Timestamp;
  completedAt: Timestamp | null;
  errorMessage: string | null;
}

export interface AuditResult {
  id: string;
  auditRunId: string;
  runDate: Timestamp;
  runMonth: string;
  pageId: string;
  pageUrl: string;
  pageName: string;
  strategy: AuditStrategy;
  performanceScore: number;
  lcp: number;
  tbt: number;
  cls: number;
  fcp: number;
  si: number;
  tti: number;
  lcpStatus: MetricStatus;
  tbtStatus: MetricStatus;
  clsStatus: MetricStatus;
  overallStatus: MetricStatus;
  serverResponseTime: number;
  totalRequestCount: number;
  totalByteWeight: number;
  resources: Resources;
  unusedJavascriptBytes: number;
  unusedCssBytes: number;
  renderBlockingSavingsMs: number;
  longTaskCount: number;
  longestTaskMs: number;
  mainThreadWorkMs: number;
  lcpElement: LCPElement | null;
  lcpBreakdown: LCPBreakdown | null;
  clsCulprits: CLSCulprit[];
  renderBlockingResources: RenderBlockingResource[];
  fontIssues: FontIssue[];
  httpProtocol: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawLighthouseCategories: any;
  rawLighthouseAuditKeys: string[];
  createdAt: Timestamp;
}

export interface AppConfig {
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  monitoredPages: MonitoredPage[];
  auditConfig: {
    strategy: AuditStrategy | 'both';
    categories: string[];
    scheduleDay: number;
    scheduleCron: string;
  };
  thresholds: CWVThresholds;
}

export interface CWVThresholds {
  lcp: { good: number; poor: number };
  tbt: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  tti: { good: number; poor: number };
  si: { good: number; poor: number };
}

export interface FixPriority {
  id: number;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  effort: 'Low' | 'Medium' | 'High';
  lcpImpact: string;
  pagesAffected: string;
  category: string;
}
