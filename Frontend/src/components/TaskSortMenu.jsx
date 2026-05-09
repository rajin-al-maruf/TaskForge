import React, { useState, useRef, useEffect } from 'react';
import { FaSortAmountDown, FaCheck } from 'react-icons/fa';

const TaskSortMenu = ({ sortBy, setSortBy }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { value: 'priority', label: 'Priority' },
    { value: 'due', label: 'Due Date' },
    { value: 'recent', label: 'Recently Added' },
  ];

  return (
    <div className="relative z-20" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-r-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
          sortBy !== 'priority'
            ? 'bg-brand-primary/10 text-brand-primary' 
            : 'text-gray-400 hover:bg-neutral-800/50 hover:text-gray-200'
        }`}
      >
        <FaSortAmountDown className={sortBy !== 'priority' ? 'text-brand-primary' : 'text-gray-400'} />
        View
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-2xl py-2 transition-all duration-300 origin-top-right overflow-hidden">
          {sortOptions.map(option => (
            <div 
              key={option.value}
              onClick={() => {
                setSortBy(option.value);
                setIsOpen(false);
              }}
              className={`px-4 py-2 hover:bg-neutral-800/50 text-sm flex items-center justify-between transition-colors cursor-pointer ${sortBy === option.value ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
            >
              <span>{option.label}</span>
              {sortBy === option.value && <FaCheck className="text-[10px] text-brand-primary" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskSortMenu;