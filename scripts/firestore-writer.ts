import admin from 'firebase-admin';

interface AuditResult {
  pageId: string;
  url: string;
  strategy: string;
  timestamp: string;
  performance: { score: number };
  lcp: number;
  tbt: number;
  cls: number;
  fcp: number;
  si: number;
  tti: number;
  serverResponseTime: number;
  resourceSummary: any[];
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
}

interface AuditRun {
  createdAt: any;
  status: 'running' | 'completed' | 'failed';
  strategy: string;
  totalPages: number;
  completedPages: number;
  failedPages: number;
  averagePerformance?: number;
  errorMessage?: string;
  updatedAt?: any;
  results?: AuditResult[];
}

export interface FirestoreWriter {
  createAuditRun(run: Omit<AuditRun, 'createdAt'>): Promise<string>;
  createAuditResult(runId: string, result: AuditResult): Promise<void>;
  updateAuditRun(runId: string, updates: Partial<AuditRun>): Promise<void>;
}

export function initializeFirestore(
  serviceAccountKey: string,
  projectId: string
): FirestoreWriter {
  try {
    const credentials = JSON.parse(serviceAccountKey);

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
      projectId,
    });

    const db = admin.firestore();

    return {
      async createAuditRun(run: Omit<AuditRun, 'createdAt'>): Promise<string> {
        const docRef = await db.collection('audit_runs').add({
          ...run,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        return docRef.id;
      },

      async createAuditResult(runId: string, result: AuditResult): Promise<void> {
        await db.collection('audit_runs').doc(runId).collection('audit_results').add({
          ...result,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      },

      async updateAuditRun(runId: string, updates: Partial<AuditRun>): Promise<void> {
        const updateData: Record<string, any> = {
          ...updates,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection('audit_runs').doc(runId).update(updateData);
      },
    };
  } catch (error) {
    throw new Error(
      `Failed to initialize Firestore: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
