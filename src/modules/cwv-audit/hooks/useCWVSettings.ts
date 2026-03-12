import { useState, useEffect } from 'react';
import type { MonitoredPage, CWVThresholds } from '../constants/pages';

interface CWVSettings {
  pages: MonitoredPage[];
  strategy: 'Desktop' | 'Mobile' | 'Both';
  thresholds: CWVThresholds;
}

export function useCWVSettings(): {
  settings: CWVSettings | null;
  saveSettings: (settings: CWVSettings) => Promise<void>;
  loading: boolean;
  error: Error | null;
} {
  const [settings, setSettings] = useState<CWVSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data = await response.json();
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const saveSettings = async (newSettings: CWVSettings) => {
    try {
      setError(null);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const updatedSettings = await response.json();
      setSettings(updatedSettings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  };

  return { settings, saveSettings, loading, error };
}
