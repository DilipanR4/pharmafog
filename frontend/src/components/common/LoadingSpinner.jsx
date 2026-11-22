import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Analyzing clinical records...', size = 'md' }) => {
  const iconSize = size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className={`${iconSize} animate-spin text-teal-600 mb-3`} />
      {message && <p className="text-xs font-medium text-slate-500">{message}</p>}
    </div>
  );
};
