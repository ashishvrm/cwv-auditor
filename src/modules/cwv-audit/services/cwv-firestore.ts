import { db } from '../../../config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  writeBatch,
  QueryConstraint,
} from 'firebase/firestore';
import type { AuditRun, AuditResult, AppConfig } from '../../../types/cwv';

const AUDIT_RUNS_COLLECTION = 'audit_runs';
const AUDIT_RESULTS_COLLECTION = 'audit_results';
const APP_CONFIG_DOC = 'cwv-audit';
const APP_CONFIG_COLLECTION = 'app_config';

/**
 * Fetch latest completed audit run
 */
export async function getLatestAuditRun(): Promise<AuditRun | null> {
  try {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'completed'),
      orderBy('runDate', 'desc'),
      limit(1),
    ];

    const q = query(collection(db, AUDIT_RUNS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as AuditRun;
  } catch (error) {
    console.error('Error fetching latest audit run:', error);
    throw error;
  }
}

/**
 * Fetch all audit runs, ordered by date desc, optional limit
 */
export async function getAuditRuns(maxResults?: number): Promise<AuditRun[]> {
  try {
    const constraints: QueryConstraint[] = [orderBy('runDate', 'desc')];

    if (maxResults) {
      constraints.push(limit(maxResults));
    }

    const q = query(collection(db, AUDIT_RUNS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as AuditRun));
  } catch (error) {
    console.error('Error fetching audit runs:', error);
    throw error;
  }
}

/**
 * Fetch audit results for a specific audit run
 */
export async function getAuditResultsByRunId(auditRunId: string): Promise<AuditResult[]> {
  try {
    const q = query(
      collection(db, AUDIT_RESULTS_COLLECTION),
      where('auditRunId', '==', auditRunId),
      orderBy('runDate', 'desc')
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as AuditResult));
  } catch (error) {
    console.error('Error fetching audit results by run ID:', error);
    throw error;
  }
}

/**
 * Fetch all audit results for a specific page across all runs (for history)
 */
export async function getPageHistory(pageId: string, maxResults?: number): Promise<AuditResult[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('pageId', '==', pageId),
      orderBy('runDate', 'desc'),
    ];

    if (maxResults) {
      constraints.push(limit(maxResults));
    }

    const q = query(collection(db, AUDIT_RESULTS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as AuditResult));
  } catch (error) {
    console.error('Error fetching page history:', error);
    throw error;
  }
}

/**
 * Fetch the app config document
 */
export async function getAppConfig(): Promise<AppConfig | null> {
  try {
    const docRef = doc(db, APP_CONFIG_COLLECTION, APP_CONFIG_DOC);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return null;
    }

    return docSnapshot.data() as AppConfig;
  } catch (error) {
    console.error('Error fetching app config:', error);
    throw error;
  }
}

/**
 * Update app config
 */
export async function updateAppConfig(config: Partial<AppConfig>): Promise<void> {
  try {
    const docRef = doc(db, APP_CONFIG_COLLECTION, APP_CONFIG_DOC);
    await updateDoc(docRef, config as Record<string, unknown>);
  } catch (error) {
    console.error('Error updating app config:', error);
    throw error;
  }
}

/**
 * Create a new audit run document, return its ID
 */
export async function createAuditRun(run: Omit<AuditRun, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, AUDIT_RUNS_COLLECTION), run);
    return docRef.id;
  } catch (error) {
    console.error('Error creating audit run:', error);
    throw error;
  }
}

/**
 * Update an existing audit run
 */
export async function updateAuditRun(runId: string, data: Partial<AuditRun>): Promise<void> {
  try {
    const docRef = doc(db, AUDIT_RUNS_COLLECTION, runId);
    await updateDoc(docRef, data as Record<string, unknown>);
  } catch (error) {
    console.error('Error updating audit run:', error);
    throw error;
  }
}

/**
 * Create an audit result document
 */
export async function createAuditResult(result: Omit<AuditResult, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, AUDIT_RESULTS_COLLECTION), result);
    return docRef.id;
  } catch (error) {
    console.error('Error creating audit result:', error);
    throw error;
  }
}

/**
 * Delete audit run and its results using batch delete
 */
export async function deleteAuditRun(runId: string): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Delete the audit run document
    const runDocRef = doc(db, AUDIT_RUNS_COLLECTION, runId);
    batch.delete(runDocRef);

    // Delete all audit results for this run
    const resultsQuery = query(
      collection(db, AUDIT_RESULTS_COLLECTION),
      where('auditRunId', '==', runId)
    );

    const resultsSnapshot = await getDocs(resultsQuery);
    resultsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error deleting audit run:', error);
    throw error;
  }
}

/**
 * Get audit results grouped by month for trends
 */
export async function getMonthlyTrends(pageId?: string, months?: number): Promise<AuditRun[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('status', '==', 'completed'),
      orderBy('runDate', 'desc'),
      limit(months || 12),
    ];

    const q = query(collection(db, AUDIT_RUNS_COLLECTION), ...constraints);
    const snapshot = await getDocs(q);

    let runs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    } as AuditRun));

    // If filtering by page, we need to fetch results and filter
    if (pageId) {
      const runsWithPageData = await Promise.all(
        runs.map(async (run) => {
          const results = await getAuditResultsByRunId(run.id);
          const hasPage = results.some((r) => r.pageId === pageId);
          return hasPage ? run : null;
        })
      );

      runs = runsWithPageData.filter((run): run is AuditRun => run !== null);
    }

    return runs;
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    throw error;
  }
}
