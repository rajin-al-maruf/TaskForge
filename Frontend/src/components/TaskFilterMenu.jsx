import React, { useState, useRef, useEffect } from 'react';
import { FaFilter, FaChevronRight, FaCheck } from 'react-icons/fa';

const TaskFilterMenu = ({ filters, setFilters, allLists, showListFilter = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const hasActiveFilters = filters && (filters.priority !== 'all' || filters.status !== 'all' || (showListFilter && filters.list !== 'all'));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const priorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'none', label: 'None' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="relative z-20" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer ${
          hasActiveFilters 
            ? 'bg-brand-primary/10 text-brand-primary' 
            : 'text-gray-400 hover:bg-neutral-800/50 hover:text-gray-200'
        }`}
      >
        <FaFilter className={hasActiveFilters ? 'text-brand-primary' : 'text-gray-400'} />
        Filter
        {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-primary ml-1" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-2xl py-2 transition-all duration-300 origin-top-right">
          
          {/* Priority Category */}
          <div className="group relative px-4 py-2.5 hover:bg-neutral-800/50 cursor-pointer flex justify-between items-center text-sm text-gray-300 hover:text-white transition-colors">
            <span>Priority</span>
            <FaChevronRight className="text-[10px] text-gray-500 group-hover:text-brand-primary" />
            
            {/* Submenu (Expands to Right) */}
            <div className="absolute left-full top-0 -mt-2 pl-2 hidden group-hover:block w-44 z-50">
              <div className="bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-2xl py-2 overflow-hidden">
                {priorities.map(p => (
                  <div 
                    key={p.value}
                    onClick={() => setFilters(prev => ({ ...prev, priority: p.value }))}
                    className={`px-4 py-2 hover:bg-neutral-800/50 text-sm flex items-center justify-between transition-colors ${filters.priority === p.value ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
                  >
                    <span>{p.label}</span>
                    {filters.priority === p.value && <FaCheck className="text-[10px] text-brand-primary" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Status Category */}
          <div className="group relative px-4 py-2.5 hover:bg-neutral-800/50 cursor-pointer flex justify-between items-center text-sm text-gray-300 hover:text-white transition-colors">
            <span>Status</span>
            <FaChevronRight className="text-[10px] text-gray-500 group-hover:text-brand-primary" />
            
            {/* Submenu */}
            <div className="absolute left-full top-0 -mt-2 pl-2 hidden group-hover:block w-44 z-50">
              <div className="bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-2xl py-2 overflow-hidden">
                {statuses.map(s => (
                  <div 
                    key={s.value}
                    onClick={() => setFilters(prev => ({ ...prev, status: s.value }))}
                    className={`px-4 py-2 hover:bg-neutral-800/50 text-sm flex items-center justify-between transition-colors ${filters.status === s.value ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
                  >
                    <span>{s.label}</span>
                    {filters.status === s.value && <FaCheck className="text-[10px] text-brand-primary" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* List Category (Conditional) */}
          {showListFilter && (
            <div className="group relative px-4 py-2.5 hover:bg-neutral-800/50 cursor-pointer flex justify-between items-center text-sm text-gray-300 hover:text-white transition-colors">
              <span>List</span>
              <FaChevronRight className="text-[10px] text-gray-500 group-hover:text-brand-primary" />
              
              {/* Submenu */}
              <div className="absolute left-full top-0 -mt-2 pl-2 hidden group-hover:block w-44 z-50">
                <div className="bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-2xl py-2 max-h-64 overflow-y-auto custom-scrollbar">
                  <div 
                    onClick={() => setFilters(prev => ({ ...prev, list: 'all' }))}
                    className={`px-4 py-2 hover:bg-neutral-800/50 text-sm flex items-center justify-between transition-colors ${filters.list === 'all' ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
                  >
                    <span>All Lists</span>
                    {filters.list === 'all' && <FaCheck className="text-[10px] text-brand-primary" />}
                  </div>
                  {allLists?.map(l => (
                    <div 
                      key={l.name}
                      onClick={() => setFilters(prev => ({ ...prev, list: l.name }))}
                      className={`px-4 py-2 hover:bg-neutral-800/50 text-sm flex items-center justify-between transition-colors ${filters.list === l.name ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
                    >
                      <span>{l.name}</span>
                      {filters.list === l.name && <FaCheck className="text-[10px] text-brand-primary" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Clear Filters Option */}
          {hasActiveFilters && (
            <>
              <div className="mx-4 my-2 border-t border-neutral-800/60"></div>
              <div 
                onClick={() => setFilters({ priority: 'all', status: 'all', list: 'all' })}
                className="px-4 py-2 hover:bg-red-500/10 cursor-pointer text-red-400 text-sm transition-colors text-center font-medium"
              >
                Clear Filters
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilterMenu;