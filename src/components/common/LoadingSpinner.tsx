import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div
            className="absolute inset-0 rounded-full border-4 border-slate-700"
            style={{
              borderTopColor: '#3b82f6',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
        <p className="text-slate-400 text-sm font-medium">Loading...</p>
      </div>
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
