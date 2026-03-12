import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import TopBar from '../common/TopBar';

const PortalLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar />

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
