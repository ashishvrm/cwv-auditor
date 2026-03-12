import React from 'react';
import { Play } from 'lucide-react';

interface RunAuditButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

const RunAuditButton: React.FC<RunAuditButtonProps> = ({ onClick, isLoading = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          Running...
        </>
      ) : (
        <>
          <Play size={16} />
          Run Audit
        </>
      )}
    </button>
  );
};

export default RunAuditButton;
