import React from 'react';
import { GrTarget } from 'react-icons/gr';

const LoadingSpinner = ({ message = "Loading...", fullScreen = true }) => {
  return (
    <div className={`${fullScreen ? 'min-h-screen' : 'h-full min-h-[300px] rounded-2xl'} w-full bg-brand-bg flex flex-col items-center justify-center relative overflow-hidden`}>
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative flex items-center justify-center mb-8 h-16 w-16">
          {/* Radar ping effect */}
          <div className="absolute inset-0 bg-brand-primary/30 rounded-full animate-ping" />
          
          {/* Spinning Inner Logo */}
          <div className="relative w-16 h-16 bg-neutral-900 border border-brand-primary/30 rounded-full flex items-center justify-center shadow-[0_0_15px_-3px_rgba(var(--color-brand-primary),0.4)] z-10">
            <GrTarget size={28} className="text-brand-primary animate-spin" />
          </div>
        </div>
        <p className="text-sm font-medium text-gray-400 animate-pulse tracking-wide">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;