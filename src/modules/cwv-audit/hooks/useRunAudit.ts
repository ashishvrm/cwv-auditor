import { useState, useCallback } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth';
import type { AuditResult } from '../../../types/cwv';
import { runPageSpeedAudit } from '../services/psi-api';
import { createAuditRun, createAuditResult, updateAuditRun } from '../services/cwv-firestore';
import { extractMetrics } from '../utils/metrics-extractor';
import { MONITORED_PAGES } from '../constants/pages';
import { format } from 'date-fns';

export interface AuditProgress {
  current: number;
  total: number;
  currentPage: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

interface UseRunAuditResult {
  runAudit: (strategy?: 'desktop' | 'mobile') => Promise<void>;
  progress: AuditProgress;
  isRunning: boolean;
  error: string | null;
}

/**
 * Hook to run a manual audit across all monitored pages
 */
export function useRunAudit(): UseRunAuditResult {
  const { user } = useAuth();
  const [progress, setProgress] = useState<AuditProgress>({
    current: 0,
    total: MONITORED_PAGES.length,
    currentPage: '',
    status: 'idle',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAudit = useCallback(
    async (strategy: 'desktop' | 'mobile' = 'desktop') => {
      if (isRunning) {
        return;
      }

      if (!user) {
        setError('User not authenticated');
        return;
      }

      try {
        setIsRunning(true);
        setError(null);
        setProgress({
          current: 0,
          total: MONITORED_PAGES.length,
          currentPage: '',
          status: 'running',
        });

        const now = new Date();
        const runMonth = format(now, 'yyyy-MM');

        // Step 1: Create audit run document
        const auditRunId = await createAuditRun({
          runDate: Timestamp.now(),
          runMonth,
          strategy,
          triggeredBy: 'manual',
          triggeredByUser: user.uid,
          status: 'running',
          pagesAudited: 0,
          avgPerformanceScore: 0,
          avgLCP: 0,
          avgTBT: 0,
          avgCLS: 0,
          avgFCP: 0,
          avgTTI: 0,
          summary: {
            good: 0,
            needsImprovement: 0,
            poor: 0,
          },
          createdAt: Timestamp.now(),
          completedAt: null,
          errorMessage: null,
        });

        const auditResults: AuditResult[] = [];

        // Step 2: Audit each page sequentially
        for (let i = 0; i < MONITORED_PAGES.length; i++) {
          const page = MONITORED_PAGES[i];

          setProgress({
            current: i + 1,
            total: MONITORED_PAGES.length,
            currentPage: page.name,
            status: 'running',
          });

          try {
            // Call PSI API
            const psiResponse = await runPageSpeedAudit(page.url, strategy);

            // Extract metrics
            const resultData = extractMetrics(psiResponse, page, auditRunId, strategy);

            // Create audit result document
            const resultId = await createAuditResult(resultData);

            auditResults.push({
              id: resultId,
              ...resultData,
            });
          } catch (pageError) {
            console.error(`Error auditing page ${page.name}:`, pageError);
            // Continue with next page even if one fails
          }
        }

        // Step 3: Calculate averages
        if (auditResults.length > 0) {
          const avgPerformanceScore =
            auditResults.reduce((sum, r) => sum + r.performanceScore, 0) / auditResults.length;
          const avgLCP = auditResults.reduce((sum, r) => sum + r.lcp, 0) / auditResults.length;
          const avgTBT = auditResults.reduce((sum, r) => sum + r.tbt, 0) / auditResults.length;
          const avgCLS = auditResults.reduce((sum, r) => sum + r.cls, 0) / auditResults.length;
          const avgFCP = auditResults.reduce((sum, r) => sum + r.fcp, 0) / auditResults.length;
          const avgTTI = auditResults.reduce((sum, r) => sum + r.tti, 0) / auditResults.length;

          // Count statuses
          const goodCount = auditResults.filter((r) => r.overallStatus === 'good').length;
          const needsImprovementCount = auditResults.filter(
            (r) => r.overallStatus === 'needs-improvement'
          ).length;
          const poorCount = auditResults.filter((r) => r.overallStatus === 'poor').length;

          // Step 4: Update audit run with results
          await updateAuditRun(auditRunId, {
            status: 'completed',
            pagesAudited: auditResults.length,
            avgPerformanceScore,
            avgLCP,
            avgTBT,
            avgCLS,
            avgFCP,
            avgTTI,
            summary: {
              good: goodCount,
              needsImprovement: needsImprovementCount,
              poor: poorCount,
            },
            completedAt: Timestamp.now(),
            errorMessage: null,
          });
        } else {
          // No successful results
          await updateAuditRun(auditRunId, {
            status: 'failed',
            completedAt: Timestamp.now(),
            errorMessage: 'No pages audited successfully',
          });

          throw new Error('Failed to audit any pages');
        }

        setProgress({
          current: MONITORED_PAGES.length,
          total: MONITORED_PAGES.length,
          currentPage: '',
          status: 'completed',
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Audit failed';
        setError(errorMessage);

        setProgress({
          current: 0,
          total: MONITORED_PAGES.length,
          currentPage: '',
          status: 'failed',
        });

        console.error('Audit error:', err);
      } finally {
        setIsRunning(false);
      }
    },
    [user, isRunning]
  );

  return {
    runAudit,
    progress,
    isRunning,
    error,
  };
}
