import { initializeFirestore, FirestoreWriter } from './firestore-writer';
import { MONITORED_PAGES, CWV_THRESHOLDS } from './config';
import { runPSIAudit } from './psi-client';
import { extractMetrics, ExtractedMetrics } from './metrics-extractor';

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
  completedPages: number;
  failedPages: number;
  averagePerformance: number;
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
  let runId: string;

  try {
    // Initialize Firestore
    firestore = initializeFirestore(
      config.firebaseServiceAccountKey,
      config.firebaseProjectId
    );

    // Create audit run
    console.log('Creating audit run...');
    runId = await firestore.createAuditRun({
      status: 'running',
      strategy: config.strategy,
      totalPages: MONITORED_PAGES.length,
      completedPages: 0,
      failedPages: 0,
    });
    console.log(`Audit run created: ${runId}`);

    const results: ExtractedMetrics[] = [];
    let completedPages = 0;
    let failedPages = 0;

    // Audit each page
    for (const page of MONITORED_PAGES) {
      try {
        console.log(`Auditing ${page.name}...`);

        const psiResponse = await runPSIAudit(page.url, config.strategy, config.psiApiKey);
        const metrics = extractMetrics(psiResponse);

        // Create audit result
        await firestore.createAuditResult(runId, {
          pageId: page.id,
          url: page.url,
          strategy: config.strategy,
          timestamp: new Date().toISOString(),
          performance: metrics.performance,
          lcp: metrics.lcp,
          tbt: metrics.tbt,
          cls: metrics.cls,
          fcp: metrics.fcp,
          si: metrics.si,
          tti: metrics.tti,
          serverResponseTime: metrics.serverResponseTime,
          resourceSummary: metrics.resourceSummary,
          unusedJs: metrics.unusedJs,
          unusedCss: metrics.unusedCss,
          renderBlocking: metrics.renderBlocking,
          longTasks: metrics.longTasks,
          mainThreadWork: metrics.mainThreadWork,
          lcpElement: metrics.lcpElement,
          clsCulprits: metrics.clsCulprits,
          fontIssues: metrics.fontIssues,
          networkRequests: metrics.networkRequests,
          totalByteWeight: metrics.totalByteWeight,
          httpProtocol: metrics.httpProtocol,
          pageWeight: metrics.pageWeight,
        });

        results.push(metrics);
        completedPages++;
        console.log(`✓ ${page.name} audited successfully`);
      } catch (error) {
        failedPages++;
        console.error(
          `✗ Failed to audit ${page.name}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Calculate average performance
    const averagePerformance =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.performance.score, 0) / results.length
        : 0;

    // Update audit run with completion status
    console.log('Finalizing audit run...');
    await firestore.updateAuditRun(runId, {
      status: 'completed',
      completedPages,
      failedPages,
      averagePerformance,
    });

    console.log(`Audit run ${runId} completed successfully`);
    return {
      runId,
      status: 'completed',
      completedPages,
      failedPages,
      averagePerformance,
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
        });
      } catch (updateError) {
        console.error(
          `Failed to update audit run status: ${updateError instanceof Error ? updateError.message : String(updateError)}`
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
