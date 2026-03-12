import { useState, useEffect, useCallback } from 'react';
import type { AuditRun } from '../../../types/cwv';
import { getAuditRuns } from '../services/cwv-firestore';

interface UseAuditRunsResult {
  runs: AuditRun[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch audit runs
 */
export function useAuditRuns(maxResults?: number): UseAuditRunsResult {
  const [runs, setRuns] = useState<AuditRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditRuns(maxResults);
      setRuns(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch audit runs';
      setError(errorMessage);
      console.error('Error fetching audit runs:', err);
    } finally {
      setLoading(false);
    }
  }, [maxResults]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  return {
    runs,
    loading,
    error,
    refetch: fetchRuns,
  };
}
