import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-2xl font-semibold text-slate-300 mb-4">
          Page Not Found
        </p>
        <p className="text-slate-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Home size={20} />
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
