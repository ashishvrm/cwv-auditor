import { useState, useCallback, useRef } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../../hooks/useAuth';
import type { AuditResult } from '../../../types/cwv';
import { runPageSpeedAudit } from '../services/psi-api';
import { createAuditRun, createAuditResult, updateAuditRun } from '../services/cwv-firestore';
import { extractMetrics } from '../utils/metrics-extractor';
import { MONITORED_PAGES } from '../constants/pages';
import { format } from 'date-fns';

export type AuditStep =
  | 'idle'
  | 'initializing'
  | 'auditing'
  | 'calculating'
  | 'saving'
  | 'completed'
  | 'failed';

export type PageAuditStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface PageAuditProgress {
  pageId: string;
  pageName: string;
  status: PageAuditStatus;
  error?: string;
  score?: number;
}

export interface AuditProgress {
  step: AuditStep;
  currentPageIndex: number;
  totalPages: number;
  currentPageName: string;
  pages: PageAuditProgress[];
  successCount: number;
  failCount: number;
  elapsedMs: number;
  error: string | null;
}

interface UseRunAuditResult {
  runAudit: (strategy?: 'desktop' | 'mobile') => Promise<void>;
  progress: AuditProgress;
  isRunning: boolean;
  error: string | null;
  dismissProgress: () => void;
}

function createInitialProgress(): AuditProgress {
  return {
    step: 'idle',
    currentPageIndex: 0,
    totalPages: MONITORED_PAGES.length,
    currentPageName: '',
    pages: MONITORED_PAGES.map((p) => ({
      pageId: p.id,
      pageName: p.name,
      status: 'pending' as PageAuditStatus,
    })),
    successCount: 0,
    failCount: 0,
    elapsedMs: 0,
    error: null,
  };
}

/**
 * Hook to run a manual audit across all monitored pages
 * Provides granular step-by-step progress tracking
 */
export function useRunAudit(onComplete?: () => void): UseRunAuditResult {
  const { user } = useAuth();
  const [progress, setProgress] = useState<AuditProgress>(createInitialProgress());
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setProgress((prev) => ({
        ...prev,
        elapsedMs: Date.now() - startTimeRef.current,
      }));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const dismissProgress = useCallback(() => {
    setProgress(createInitialProgress());
    setError(null);
  }, []);

  const runAudit = useCallback(
    async (strategy: 'desktop' | 'mobile' = 'desktop') => {
      if (isRunning) return;
      if (!user) {
        setError('User not authenticated');
        return;
      }

      try {
        setIsRunning(true);
        setError(null);

        // Reset pages progress
        const initialPages: PageAuditProgress[] = MONITORED_PAGES.map((p) => ({
          pageId: p.id,
          pageName: p.name,
          status: 'pending' as PageAuditStatus,
        }));

        // Step 1: Initializing
        setProgress({
          step: 'initializing',
          currentPageIndex: 0,
          totalPages: MONITORED_PAGES.length,
          currentPageName: '',
          pages: initialPages,
          successCount: 0,
          failCount: 0,
          elapsedMs: 0,
          error: null,
        });
        startTimer();

        const now = new Date();
        const runMonth = format(now, 'yyyy-MM');

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
          summary: { good: 0, needsImprovement: 0, poor: 0 },
          createdAt: Timestamp.now(),
          completedAt: null,
          errorMessage: null,
        });

        const auditResults: AuditResult[] = [];
        const pagesProgress = [...initialPages];
        let successCount = 0;
        let failCount = 0;

        // Step 2: Audit each page
        for (let i = 0; i < MONITORED_PAGES.length; i++) {
          const page = MONITORED_PAGES[i];

          // Mark current page as running
          pagesProgress[i] = { ...pagesProgress[i], status: 'running' };

          setProgress((prev) => ({
            ...prev,
            step: 'auditing',
            currentPageIndex: i,
            currentPageName: page.name,
            pages: [...pagesProgress],
          }));

          try {
            const psiResponse = await runPageSpeedAudit(page.url, strategy);
            const resultData = extractMetrics(psiResponse, page, auditRunId, strategy);
            const resultId = await createAuditResult(resultData);

            // performanceScore is already 0-100 from extractMetrics
            const score = Math.round(resultData.performanceScore);
            pagesProgress[i] = { ...pagesProgress[i], status: 'success', score };
            successCount++;

            auditResults.push({ id: resultId, ...resultData });
          } catch (pageError) {
            const errMsg = pageError instanceof Error ? pageError.message : 'Unknown error';
            console.error(`Error auditing page ${page.name}:`, pageError);
            pagesProgress[i] = { ...pagesProgress[i], status: 'failed', error: errMsg };
            failCount++;
          }

          setProgress((prev) => ({
            ...prev,
            pages: [...pagesProgress],
            successCount,
            failCount,
          }));
        }

        // Step 3: Calculating averages
        setProgress((prev) => ({
          ...prev,
          step: 'calculating',
          currentPageName: '',
        }));

        if (auditResults.length > 0) {
          const avgPerformanceScore =
            auditResults.reduce((sum, r) => sum + r.performanceScore, 0) / auditResults.length;
          const avgLCP = auditResults.reduce((sum, r) => sum + r.lcp, 0) / auditResults.length;
          const avgTBT = auditResults.reduce((sum, r) => sum + r.tbt, 0) / auditResults.length;
          const avgCLS = auditResults.reduce((sum, r) => sum + r.cls, 0) / auditResults.length;
          const avgFCP = auditResults.reduce((sum, r) => sum + r.fcp, 0) / auditResults.length;
          const avgTTI = auditResults.reduce((sum, r) => sum + r.tti, 0) / auditResults.length;

          const goodCount = auditResults.filter((r) => r.overallStatus === 'good').length;
          const needsImprovementCount = auditResults.filter(
            (r) => r.overallStatus === 'needs-improvement'
          ).length;
          const poorCount = auditResults.filter((r) => r.overallStatus === 'poor').length;

          // Step 4: Saving to Firestore
          setProgress((prev) => ({ ...prev, step: 'saving' }));

          await updateAuditRun(auditRunId, {
            status: 'completed',
            pagesAudited: auditResults.length,
            avgPerformanceScore,
            avgLCP,
            avgTBT,
            avgCLS,
            avgFCP,
            avgTTI,
            summary: { good: goodCount, needsImprovement: needsImprovementCount, poor: poorCount },
            completedAt: Timestamp.now(),
            errorMessage: null,
          });
        } else {
          await updateAuditRun(auditRunId, {
            status: 'failed',
            completedAt: Timestamp.now(),
            errorMessage: 'No pages audited successfully',
          });
          throw new Error('Failed to audit any pages');
        }

        stopTimer();

        // Step 5: Completed
        setProgress((prev) => ({
          ...prev,
          step: 'completed',
          elapsedMs: Date.now() - startTimeRef.current,
        }));

        // Trigger refetch callback
        onComplete?.();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Audit failed';
        setError(errorMessage);
        stopTimer();

        setProgress((prev) => ({
          ...prev,
          step: 'failed',
          error: errorMessage,
          elapsedMs: Date.now() - startTimeRef.current,
        }));

        console.error('Audit error:', err);
      } finally {
        setIsRunning(false);
      }
    },
    [user, isRunning, startTimer, stopTimer, onComplete]
  );

  return { runAudit, progress, isRunning, error, dismissProgress };
}
