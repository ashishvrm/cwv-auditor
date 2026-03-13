import { initializeFirestore, FirestoreWriter, AuditResult } from './firestore-writer';
import { MONITORED_PAGES, CWV_THRESHOLDS } from './config';
import { runPSIAudit } from './psi-client';
import { extractMetrics } from './metrics-extractor';
import admin from 'firebase-admin';

interface AuditConfig {
  psiApiKey: string;
  firebaseServiceAccountKey: string;
  firebaseProjectId: string;
  strategy: 'mobile' | 'desktop';
}

interface AuditRunResult {
  runId: string;
  status: 'completed' | 'failed';
  error?: string;
  pagesAudited: number;
  avgPerformanceScore: number;
  avgLCP: number;
  avgTBT: number;
  avgCLS: number;
  avgFCP: number;
  avgTTI: number;
  summary: { good: number; needsImprovement: number; poor: number };
}

async function runAudit(): Promise<AuditRunResult> {
  const config: AuditConfig = {
    psiApiKey: process.env.PSI_API_KEY || '',
    firebaseServiceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '',
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
    strategy: (process.env.AUDIT_STRATEGY as 'mobile' | 'desktop') || 'desktop',
  };

  // Validate configuration
  if (!config.psiApiKey) {
    console.error('PSI_API_KEY environment variable is not set');
    process.exit(1);
  }
  if (!config.firebaseServiceAccountKey) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set');
    process.exit(1);
  }
  if (!config.firebaseProjectId) {
    console.error('FIREBASE_PROJECT_ID environment variable is not set');
    process.exit(1);
  }

  let firestore: FirestoreWriter;
  let runId: string = '';
  const now = new Date();
  const runMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  try {
    // Initialize Firestore
    firestore = initializeFirestore(
      config.firebaseServiceAccountKey,
      config.firebaseProjectId
    );

    // Get app config or use fallback
    console.log('Fetching app config...');
    const appConfig = await firestore.getAppConfig();
    const monitoredPages = appConfig?.monitoredPages || MONITORED_PAGES;

    // Create audit run
    console.log('Creating audit run...');
    runId = await firestore.createAuditRun({
      runDate: admin.firestore.Timestamp.now(),
      runMonth,
      strategy: config.strategy,
      triggeredBy: 'scheduled',
      triggeredByUser: null,
      status: 'running',
      pagesAudited: 0,
      avgPerformanceScore: 0,
      avgLCP: 0,
      avgTBT: 0,
      avgCLS: 0,
      avgFCP: 0,
      avgTTI: 0,
      summary: { good: 0, needsImprovement: 0, poor: 0 },
      completedAt: null,
      errorMessage: null,
    });
    console.log(`Audit run created: ${runId}`);

    const results: Omit<AuditResult, 'id' | 'createdAt'>[] = [];
    let successCount = 0;
    let failCount = 0;

    // Audit each page
    for (const page of monitoredPages) {
      try {
        console.log(`Auditing ${page.name}...`);

        const psiResponse = await runPSIAudit(
          page.url,
          config.strategy,
          config.psiApiKey
        );

        const auditResult = extractMetrics(
          psiResponse,
          page.id,
          page.url,
          page.name,
          runId,
          config.strategy,
          now
        );

        // Write audit result to top-level collection
        await firestore.createAuditResult(auditResult);

        results.push(auditResult);
        successCount++;
        console.log(`✓ ${page.name} audited successfully`);
      } catch (error) {
        failCount++;
        console.error(
          `✗ Failed to audit ${page.name}: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    }

    // Calculate averages and summary
    const avgPerformanceScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.performanceScore, 0) / results.length
        : 0;

    const avgLCP =
      results.length > 0 ? results.reduce((sum, r) => sum + r.lcp, 0) / results.length : 0;

    const avgTBT =
      results.length > 0 ? results.reduce((sum, r) => sum + r.tbt, 0) / results.length : 0;

    const avgCLS =
      results.length > 0 ? results.reduce((sum, r) => sum + r.cls, 0) / results.length : 0;

    const avgFCP =
      results.length > 0 ? results.reduce((sum, r) => sum + r.fcp, 0) / results.length : 0;

    const avgTTI =
      results.length > 0 ? results.reduce((sum, r) => sum + r.tti, 0) / results.length : 0;

    // Count statuses
    const summary = {
      good: results.filter((r) => r.overallStatus === 'good').length,
      needsImprovement: results.filter((r) => r.overallStatus === 'needs-improvement').length,
      poor: results.filter((r) => r.overallStatus === 'poor').length,
    };

    // Update audit run with completion status
    console.log('Finalizing audit run...');
    await firestore.updateAuditRun(runId, {
      status: 'completed',
      pagesAudited: successCount,
      avgPerformanceScore: Math.round(avgPerformanceScore),
      avgLCP: Math.round(avgLCP),
      avgTBT: Math.round(avgTBT),
      avgCLS: Math.round(avgCLS * 100) / 100,
      avgFCP: Math.round(avgFCP),
      avgTTI: Math.round(avgTTI),
      summary,
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Audit run ${runId} completed successfully`);
    return {
      runId,
      status: 'completed',
      pagesAudited: successCount,
      avgPerformanceScore: Math.round(avgPerformanceScore),
      avgLCP: Math.round(avgLCP),
      avgTBT: Math.round(avgTBT),
      avgCLS: Math.round(avgCLS * 100) / 100,
      avgFCP: Math.round(avgFCP),
      avgTTI: Math.round(avgTTI),
      summary,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error(`Audit run failed: ${errorMessage}`);

    // Update audit run with failure status
    if (runId && firestore) {
      try {
        await firestore.updateAuditRun(runId, {
          status: 'failed',
          errorMessage,
          completedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (updateError) {
        console.error(
          `Failed to update audit run status: ${
            updateError instanceof Error ? updateError.message : String(updateError)
          }`
        );
      }
    }

    process.exit(1);
  }
}

// Run the audit
runAudit().then(() => {
  process.exit(0);
});
