export interface MonitoredPage {
  id: string;
  url: string;
  name: string;
  shortName: string;
  template: string;
}

export interface CWVThreshold {
  good: number;
  poor: number;
}

export interface CWVThresholds {
  lcp: CWVThreshold;
  tbt: CWVThreshold;
  cls: CWVThreshold;
  fcp: CWVThreshold;
  tti: CWVThreshold;
  si: CWVThreshold;
}

export const MONITORED_PAGES: MonitoredPage[] = [
  {
    id: 'homepage',
    url: 'https://www.infarmbureau.com',
    name: 'Homepage',
    shortName: 'Home',
    template: 'homepage',
  },
  {
    id: 'auto-product',
    url: 'https://www.infarmbureau.com/auto',
    name: 'Auto Product',
    shortName: 'Auto',
    template: 'product',
  },
  {
    id: 'life-product',
    url: 'https://www.infarmbureau.com/life',
    name: 'Life Product',
    shortName: 'Life',
    template: 'product',
  },
  {
    id: 'article',
    url: 'https://www.infarmbureau.com/inside-story/articles/homeowners-insurance-guide-2023',
    name: 'Article Page',
    shortName: 'Article',
    template: 'article',
  },
  {
    id: 'agent-page',
    url: 'https://www.infarmbureau.com/agents/Kent-Shaffer-Marion-Indianapolis-IN',
    name: 'Agent Page',
    shortName: 'Agent',
    template: 'agent',
  },
  {
    id: 'office-page',
    url: 'https://www.infarmbureau.com/offices/Marion/Home Office Agent',
    name: 'Office Page',
    shortName: 'Office',
    template: 'office',
  },
  {
    id: 'claim-form',
    url: 'https://www.infarmbureau.com/claims/report-claim?type=auto',
    name: 'Auto Claim Form',
    shortName: 'Claim',
    template: 'form',
  },
];

export const CWV_THRESHOLDS: CWVThresholds = {
  lcp: { good: 2500, poor: 4000 },
  tbt: { good: 200, poor: 600 },
  cls: { good: 0.1, poor: 0.25 },
  fcp: { good: 1800, poor: 3000 },
  tti: { good: 3800, poor: 7300 },
  si: { good: 3400, poor: 5800 },
};
