export interface FixPriority {
  id: string;
  description: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  effort: 'Low' | 'Medium' | 'High';
  lcpImpact: string;
  pagesAffected: string;
  category: 'performance' | 'rendering' | 'resources' | 'javascript' | 'images' | 'fonts';
}

export const FIX_PRIORITIES: FixPriority[] = [
  {
    id: 'optimize-hero-image',
    description: 'Optimize and lazy-load hero image on homepage',
    priority: 'CRITICAL',
    effort: 'Low',
    lcpImpact: 'Potential 1200ms improvement',
    pagesAffected: 'Homepage, Product pages',
    category: 'images',
  },
  {
    id: 'defer-javascript',
    description: 'Defer non-critical JavaScript execution',
    priority: 'CRITICAL',
    effort: 'Medium',
    lcpImpact: 'Potential 800ms improvement',
    pagesAffected: 'All pages',
    category: 'javascript',
  },
  {
    id: 'reduce-unused-css',
    description: 'Eliminate unused CSS and minify stylesheets',
    priority: 'HIGH',
    effort: 'Medium',
    lcpImpact: 'Potential 400ms improvement',
    pagesAffected: 'All pages',
    category: 'resources',
  },
  {
    id: 'implement-critical-css',
    description: 'Inline critical CSS above the fold',
    priority: 'HIGH',
    effort: 'Medium',
    lcpImpact: 'Potential 600ms improvement',
    pagesAffected: 'All pages',
    category: 'rendering',
  },
  {
    id: 'optimize-third-party-scripts',
    description: 'Load third-party analytics and ads asynchronously',
    priority: 'HIGH',
    effort: 'Medium',
    lcpImpact: 'Potential 500ms improvement',
    pagesAffected: 'All pages',
    category: 'javascript',
  },
  {
    id: 'enable-gzip-compression',
    description: 'Enable GZIP compression on server',
    priority: 'HIGH',
    effort: 'Low',
    lcpImpact: 'Potential 300ms improvement',
    pagesAffected: 'All pages',
    category: 'resources',
  },
  {
    id: 'implement-caching-headers',
    description: 'Configure browser cache headers for static assets',
    priority: 'MEDIUM',
    effort: 'Low',
    lcpImpact: 'Potential 200ms improvement (repeat visits)',
    pagesAffected: 'All pages',
    category: 'resources',
  },
  {
    id: 'optimize-fonts',
    description: 'Use system fonts or variable fonts, implement font-display swap',
    priority: 'MEDIUM',
    effort: 'Low',
    lcpImpact: 'Potential 150ms improvement',
    pagesAffected: 'All pages',
    category: 'fonts',
  },
  {
    id: 'implement-cdn',
    description: 'Use CDN for static assets and images',
    priority: 'MEDIUM',
    effort: 'Medium',
    lcpImpact: 'Potential 400ms improvement',
    pagesAffected: 'All pages',
    category: 'resources',
  },
  {
    id: 'optimize-database-queries',
    description: 'Optimize database queries and implement caching',
    priority: 'MEDIUM',
    effort: 'High',
    lcpImpact: 'Potential 700ms improvement',
    pagesAffected: 'Article, Agent, Office pages',
    category: 'performance',
  },
  {
    id: 'reduce-layout-shifts',
    description: 'Fix elements causing Cumulative Layout Shift',
    priority: 'HIGH',
    effort: 'Medium',
    lcpImpact: 'CLS reduction by 0.1+',
    pagesAffected: 'All pages',
    category: 'rendering',
  },
  {
    id: 'preload-critical-resources',
    description: 'Add preload hints for critical resources',
    priority: 'MEDIUM',
    effort: 'Low',
    lcpImpact: 'Potential 250ms improvement',
    pagesAffected: 'All pages',
    category: 'resources',
  },
  {
    id: 'remove-render-blocking-resources',
    description: 'Convert blocking CSS/JS to non-blocking or inline critical portions',
    priority: 'CRITICAL',
    effort: 'High',
    lcpImpact: 'Potential 1500ms improvement',
    pagesAffected: 'All pages',
    category: 'rendering',
  },
  {
    id: 'implement-progressive-image-loading',
    description: 'Use progressive JPEG or AVIF format with fallbacks',
    priority: 'MEDIUM',
    effort: 'Medium',
    lcpImpact: 'Potential 350ms improvement',
    pagesAffected: 'Product pages, Article page',
    category: 'images',
  },
  {
    id: 'optimize-web-fonts-loading',
    description: 'Minimize web fonts, use subset, implement font-display policy',
    priority: 'HIGH',
    effort: 'Medium',
    lcpImpact: 'Potential 400ms improvement',
    pagesAffected: 'All pages',
    category: 'fonts',
  },
];

export function getPrioritiesByCategory(category: string): FixPriority[] {
  return FIX_PRIORITIES.filter((p) => p.category === category);
}

export function getPrioritiesByPriority(priority: string): FixPriority[] {
  return FIX_PRIORITIES.filter((p) => p.priority === priority);
}

export function getPrioritiesByCriticality(): FixPriority[] {
  return [...FIX_PRIORITIES].sort((a, b) => {
    const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
    const effortOrder = { Low: 0, Medium: 1, High: 2 };

    const aOrder = (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 3) * 10 -
      (effortOrder[a.effort as keyof typeof effortOrder] ?? 3);
    const bOrder = (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 3) * 10 -
      (effortOrder[b.effort as keyof typeof effortOrder] ?? 3);

    return aOrder - bOrder;
  });
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'CRITICAL':
      return '#ef4444';
    case 'HIGH':
      return '#f59e0b';
    case 'MEDIUM':
      return '#3b82f6';
    default:
      return '#6b7280';
  }
}

export function getEffortColor(effort: string): string {
  switch (effort) {
    case 'Low':
      return '#22c55e';
    case 'Medium':
      return '#f59e0b';
    case 'High':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}
