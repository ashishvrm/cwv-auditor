import fetch from 'node-fetch';

interface PSIResponse {
  lighthouseResult: {
    categories: {
      performance: {
        score: number;
      };
    };
    audits: Record<string, any>;
  };
  loadingExperience?: Record<string, any>;
}

interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  timeoutMs: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 2000,
  timeoutMs: 120000,
};

export async function runPSIAudit(
  url: string,
  strategy: 'mobile' | 'desktop',
  apiKey: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<PSIResponse> {
  const endpoint = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      const params = new URLSearchParams({
        url,
        key: apiKey,
        category: 'performance',
        strategy,
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

      const response = await fetch(`${endpoint}?${params}`, {
        signal: controller.signal as any,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`PSI API error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as PSIResponse;
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.maxRetries - 1) {
        const delayMs = config.baseDelayMs * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw new Error(`PSI audit failed after ${config.maxRetries} attempts: ${lastError?.message}`);
}
