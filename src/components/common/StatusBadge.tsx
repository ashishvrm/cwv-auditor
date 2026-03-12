import React from 'react';

interface StatusBadgeProps {
  status: 'good' | 'needs-improvement' | 'poor';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const statusConfig = {
    good: {
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      label: label || 'Good',
    },
    'needs-improvement': {
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      label: label || 'Needs Improvement',
    },
    poor: {
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      label: label || 'Poor',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}
    >
      {config.label}
    </span>
  );
};
