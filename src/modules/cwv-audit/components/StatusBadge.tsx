import React from 'react';

type Status = 'success' | 'warning' | 'error';

interface StatusBadgeProps {
  value: number;
  unit: string;
  status: Status;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ value, unit, status }) => {
  const getStyles = (s: Status) => {
    switch (s) {
      case 'success':
        return 'bg-green-900 text-green-200 border-green-700';
      case 'warning':
        return 'bg-amber-900 text-amber-200 border-amber-700';
      case 'error':
        return 'bg-red-900 text-red-200 border-red-700';
    }
  };

  const getStatusLabel = (s: Status) => {
    switch (s) {
      case 'success':
        return 'Good';
      case 'warning':
        return 'Needs Work';
      case 'error':
        return 'Poor';
    }
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStyles(status)}`}>
      {value.toFixed(1)}{unit && unit}
      <span className="text-xs opacity-75">{getStatusLabel(status)}</span>
    </span>
  );
};

export default StatusBadge;
