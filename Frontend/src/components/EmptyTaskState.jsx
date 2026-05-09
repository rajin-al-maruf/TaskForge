import React from 'react';
import { RiTaskLine } from 'react-icons/ri';

const EmptyTaskState = ({ title = "No tasks yet", description = "Get started by creating a new task.", onAdd }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-4 mt-6 bg-neutral-900/20 border border-neutral-800/50 border-dashed rounded-2xl text-center transition-all duration-500 hover:bg-neutral-900/40">
      
      {/* Animated Icon Wrapper */}
      <div className="relative w-24 h-24 mb-6 flex items-center justify-center">
        <div className="absolute inset-0 bg-brand-primary/20 rounded-full animate-pulse"></div>
        <div className="relative bg-neutral-800/80 rounded-full w-20 h-20 flex items-center justify-center shadow-xl border border-neutral-700/50">
          <RiTaskLine className="w-10 h-10 text-brand-primary opacity-80 animate-bounce" style={{ animationDuration: '2s' }} />
        </div>
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-8 leading-relaxed">
        {description}
      </p>

      {/* Optional Call to Action */}
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 shadow-lg hover:shadow-brand-primary/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          + Create New Task
        </button>
      )}
    </div>
  );
};

export default EmptyTaskState;