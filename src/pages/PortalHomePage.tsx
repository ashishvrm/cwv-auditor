import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AppCard from '../components/portal/AppCard';

const PortalHomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.displayName}
        </h1>
        <p className="text-slate-400">
          Monitor and analyze your Core Web Vitals performance
        </p>
      </div>

      {/* Your Tools Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white mb-6">Your Tools</h2>

        {/* Grid of App Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CWV Audit - Enabled */}
          <AppCard
            id="cwv-audit"
            name="CWV Audit"
            description="Core Web Vitals monitoring for infarmbureau.com"
            icon="Activity"
            route="/cwv-audit"
            enabled={true}
            comingSoon={false}
          />

          {/* SEO Crawler - Coming Soon */}
          <AppCard
            id="seo-crawler"
            name="SEO Crawler"
            description="Comprehensive SEO analysis and site crawling"
            icon="Search"
            route="/seo-crawler"
            enabled={false}
            comingSoon={true}
          />

          {/* Content Audit - Coming Soon */}
          <AppCard
            id="content-audit"
            name="Content Audit"
            description="Analyze and optimize your content quality"
            icon="FileText"
            route="/content-audit"
            enabled={false}
            comingSoon={true}
          />

          {/* Backlink Monitor - Coming Soon */}
          <AppCard
            id="backlink-monitor"
            name="Backlink Monitor"
            description="Track and analyze your website's backlinks"
            icon="Link"
            route="/backlink-monitor"
            enabled={false}
            comingSoon={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PortalHomePage;
