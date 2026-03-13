import admin from 'firebase-admin';

export interface AuditRun {
  id?: string;
  runDate: any;
  runMonth: string;
  strategy: 'desktop' | 'mobile';
  triggeredBy: 'scheduled' | 'manual';
  triggeredByUser: string | null;
  status: 'completed' | 'failed' | 'running';
  pagesAudited: number;
  avgPerformanceScore: number;
  avgLCP: number;
  avgTBT: number;
  avgCLS: number;
  avgFCP: number;
  avgTTI: number;
  summary: { good: number; needsImprovement: number; poor: number };
  createdAt: any;
  completedAt: any | null;
  errorMessage: string | null;
}

export interface AuditResult {
  id?: string;
  auditRunId: string;
  runDate: any;
  runMonth: string;
  pageId: string;
  pageUrl: string;
  pageName: string;
  strategy: 'desktop' | 'mobile';
  performanceScore: number;
  lcp: number;
  tbt: number;
  cls: number;
  fcp: number;
  si: number;
  tti: number;
  lcpStatus: 'good' | 'needs-improvement' | 'poor';
  tbtStatus: 'good' | 'needs-improvement' | 'poor';
  clsStatus: 'good' | 'needs-improvement' | 'poor';
  overallStatus: 'good' | 'needs-improvement' | 'poor';
  serverResponseTime: number;
  totalRequestCount: number;
  totalByteWeight: number;
  resources: {
    scripts: { count: number; bytes: number };
    images: { count: number; bytes: number };
    fonts: { count: number; bytes: number };
    stylesheets: { count: number; bytes: number };
    documents: { count: number; bytes: number };
    thirdParty: { count: number; bytes: number };
    other: { count: number; bytes: number };
  };
  unusedJavascriptBytes: number;
  unusedCssBytes: number;
  renderBlockingSavingsMs: number;
  longTaskCount: number;
  longestTaskMs: number;
  mainThreadWorkMs: number;
  lcpElement: { selector: string; snippet: string; nodeLabel: string } | null;
  lcpBreakdown: {
    ttfb: number;
    resourceLoadDelay: number;
    resourceLoadDuration: number;
    elementRenderDelay: number;
  } | null;
  clsCulprits: Array<{ selector: string; score: number; cause: string }>;
  renderBlockingResources: Array<{ url: string; totalBytes: number; wastedMs: number }>;
  fontIssues: Array<{ url: string; wastedMs: number }>;
  httpProtocol: string;
  rawLighthouseCategories: any;
  rawLighthouseAuditKeys: string[];
  createdAt: any;
}

export interface AppConfig {
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  monitoredPages: Array<{
    id: string;
    url: string;
    name: string;
    shortName: string;
    template: string;
  }>;
  auditConfig: {
    strategy: 'desktop' | 'mobile';
    categories: string[];
    scheduleDay: number;
    scheduleCron: string;
  };
  thresholds: {
    lcp: { good: number; poor: number };
    tbt: { good: number; poor: number };
    cls: { good: number; poor: number };
    fcp: { good: number; poor: number };
    tti: { good: number; poor: number };
    si: { good: number; poor: number };
  };
}

export interface FirestoreWriter {
  createAuditRun(
    run: Omit<AuditRun, 'id' | 'createdAt'>
  ): Promise<string>;
  createAuditResult(result: Omit<AuditResult, 'id' | 'createdAt'>): Promise<string>;
  updateAuditRun(runId: string, updates: Partial<AuditRun>): Promise<void>;
  getAppConfig(): Promise<AppConfig | null>;
}

let initialized = false;

export function initializeFirestore(
  serviceAccountKey: string,
  projectId: string
): FirestoreWriter {
  try {
    const credentials = JSON.parse(serviceAccountKey);

    if (!initialized) {
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        projectId,
      });
      initialized = true;
    }

    const db = admin.firestore();

    return {
      async createAuditRun(
        run: Omit<AuditRun, 'id' | 'createdAt'>
      ): Promise<string> {
        const docRef = await db.collection('audit_runs').add({
          ...run,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return docRef.id;
      },

      async createAuditResult(
        result: Omit<AuditResult, 'id' | 'createdAt'>
      ): Promise<string> {
        const docRef = await db.collection('audit_results').add({
          ...result,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return docRef.id;
      },

      async updateAuditRun(
        runId: string,
        updates: Partial<AuditRun>
      ): Promise<void> {
        const updateData: Record<string, any> = { ...updates };

        await db.collection('audit_runs').doc(runId).update(updateData);
      },

      async getAppConfig(): Promise<AppConfig | null> {
        const doc = await db.collection('app_config').doc('cwv-audit').get();

        if (!doc.exists) {
          return null;
        }

        return doc.data() as AppConfig;
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to initialize Firestore: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
