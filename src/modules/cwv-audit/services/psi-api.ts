export interface PSIResponse {
  lighthouseResult: {
    categories: {
      performance: {
        score: number;
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audits: Record<string, any>;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

const PSI_API_ENDPOINT = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const TIMEOUT_MS = 120000; // 120 seconds

/**
 * Run a PageSpeed Insights audit on a given URL
 */
export async function runPageSpeedAudit(
  url: string,
  strategy: 'desktop' | 'mobile' = 'desktop'
): Promise<PSIResponse> {
  const apiKey = import.meta.env.VITE_PSI_API_KEY;

  if (!apiKey) {
    throw new Error('PSI_API_KEY environment variable is not set');
  }

  const params = new URLSearchParams({
    url,
    key: apiKey,
    category: 'performance',
    strategy,
  });

  const fullUrl = `${PSI_API_ENDPOINT}?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(fullUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `PSI API request failed with status ${response.status}: ${errorData}`
      );
    }

    const data = (await response.json()) as PSIResponse;
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`PSI API request timed out after ${TIMEOUT_MS}ms`);
      }
      throw new Error(`PSI API request failed: ${error.message}`);
    }
    throw error;
  }
}
