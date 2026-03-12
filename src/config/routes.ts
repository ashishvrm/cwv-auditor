export const ROUTES = {
  LOGIN: '/login',
  HOME: '/',
  CWV_AUDIT: {
    ROOT: '/cwv-audit',
    DASHBOARD: '/cwv-audit/dashboard',
    PAGES: '/cwv-audit/pages',
    PAGE_DETAIL: (pageId: string) => `/cwv-audit/pages/${pageId}`,
    TRENDS: '/cwv-audit/trends',
    SETTINGS: '/cwv-audit/settings',
  },
} as const;
