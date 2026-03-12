import { useState, useEffect, useCallback } from 'react';
import type { AuditResult } from '../../../types/cwv';
import { getPageHistory } from '../services/cwv-firestore';

interface UsePageHistoryResult {
  history: AuditResult[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch audit history for a specific page
 */
export function usePageHistory(pageId: string, maxResults?: number): UsePageHistoryResult {
  const [history, setHistory] = useState<AuditResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPageHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPageHistory(pageId, maxResults);
      setHistory(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch page history';
      setError(errorMessage);
      console.error('Error fetching page history:', err);
    } finally {
      setLoading(false);
    }
  }, [pageId, maxResults]);

  useEffect(() => {
    fetchPageHistory();
  }, [fetchPageHistory]);

  return {
    history,
    loading,
    error,
  };
}
