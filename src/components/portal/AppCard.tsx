import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

interface AppCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  enabled: boolean;
  comingSoon?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({
  name,
  description,
  icon,
  route,
  enabled,
  comingSoon = false,
}) => {
  const navigate = useNavigate();

  // Get icon component from lucide-react
  const IconComponent = (
    LucideIcons as unknown as Record<string, React.ComponentType<{ size: number }>>
  )[icon];

  const handleClick = () => {
    if (enabled && !comingSoon) {
      navigate(route);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative border rounded-lg p-6 transition-all ${
        comingSoon || !enabled
          ? 'bg-slate-800 border-slate-700 opacity-60 cursor-not-allowed'
          : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750 cursor-pointer hover:shadow-lg hover:shadow-slate-900'
      }`}
    >
      {/* Coming Soon Badge */}
      {comingSoon && (
        <div className="absolute top-3 right-3">
          <span className="inline-block bg-slate-700 text-slate-300 text-xs font-semibold px-2 py-1 rounded">
            Coming Soon
          </span>
        </div>
      )}

      {/* Icon */}
      {IconComponent && (
        <div className="mb-4 text-slate-400 group-hover:text-slate-300 transition-colors">
          <IconComponent size={32} />
        </div>
      )}

      {/* Name */}
      <h3 className="text-lg font-semibold text-white mb-2">{name}</h3>

      {/* Description */}
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default AppCard;
