import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 px-6 py-4 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-700">PharmaFog v1.0.0</span>
          <span>•</span>
          <span>Clinical Decision Support Platform</span>
        </div>
        <div className="text-center sm:text-right text-[11px] text-slate-400">
          Decision Support System. Never modify therapy without qualified clinician review.
        </div>
      </div>
    </footer>
  );
};
