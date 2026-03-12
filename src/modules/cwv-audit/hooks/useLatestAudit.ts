import { useState, useEffect, useCallback } from 'react';
import type { AuditRun, AuditResult } from '../../../types/cwv';
import { getLatestAuditRun, getAuditResultsByRunId } from '../services/cwv-firestore';

interface UseLatestAuditResult {
  run: AuditRun | null;
  results: AuditResult[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch the latest audit run and its results
 */
export function useLatestAudit(): UseLatestAuditResult {
  const [run, setRun] = useState<AuditRun | null>(null);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestAudit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the latest audit run
      const latestRun = await getLatestAuditRun();

      if (!latestRun) {
        setRun(null);
        setResults([]);
        return;
      }

      setRun(latestRun);

      // Fetch results for this run
      const auditResults = await getAuditResultsByRunId(latestRun.id);
      setResults(auditResults);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch latest audit';
      setError(errorMessage);
      console.error('Error fetching latest audit:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestAudit();
  }, [fetchLatestAudit]);

  return {
    run,
    results,
    loading,
    error,
    refetch: fetchLatestAudit,
  };
}
