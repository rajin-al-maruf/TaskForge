import React, { useState } from 'react';

const padDate = (value) => String(value).padStart(2, '0');
const toLocalISODate = (date) => `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`;

const DatePicker = ({ isOpen, date, onChange, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (!date) return new Date();
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  });

  const getDaysInMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d) => {
    const day = new Date(d.getFullYear(), d.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday is 0, Sunday is 6
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(toLocalISODate(selectedDate));
    onClose();
  };

  const handleQuickSelect = (offset) => {
    const d = new Date();
    if (offset === 'tomorrow') d.setDate(d.getDate() + 1);
    else if (offset === 'nextweek') d.setDate(d.getDate() + 7);
    onChange(toLocalISODate(d));
    onClose();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className='text-gray-700 text-[10px] text-center py-1.5'></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = toLocalISODate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    const isSelected = date === dateStr;
    const isToday = dateStr === toLocalISODate(new Date());

    days.push(
      <button
        key={day}
        type="button"
        onClick={() => handleDateSelect(day)}
        className={`text-sm py-1.5 rounded-md transition-all cursor-pointer font-medium ${
          isSelected ? 'bg-brand-primary text-white shadow-md' : isToday ? 'bg-neutral-700 text-white' : 'text-gray-400 hover:text-white hover:bg-neutral-800'
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className={`absolute left-0 top-full mt-2 w-[280px] bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl p-4 shadow-2xl transition-all duration-300 origin-top-left ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-sm text-white font-semibold'>{monthYear}</h3>
        <div className='flex gap-1'>
          <button type='button' onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className='h-7 w-7 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded transition text-lg cursor-pointer'>‹</button>
          <button type='button' onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className='h-7 w-7 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded transition text-lg cursor-pointer'>›</button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1 mb-1'>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className='text-gray-500 text-[10px] font-bold tracking-wide text-center py-1.5'>{d}</div>
        ))}
      </div>

      <div className='grid grid-cols-7 gap-1 mb-3'>
        {days}
      </div>

      <div className='space-y-0.5 pt-3 border-t border-neutral-800/80'>
        <button type='button' onClick={() => handleQuickSelect('tomorrow')} className='w-full text-left text-sm text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 px-2 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-2'>Tomorrow</button>
        <button type='button' onClick={() => handleQuickSelect('nextweek')} className='w-full text-left text-sm text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 px-2 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-2'>Next week</button>
        <button type='button' onClick={() => { onChange(''); onClose(); }} className='w-full text-left text-sm text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 px-2 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-2'>No Date</button>
      </div>
    </div>
  );
};

export default DatePicker;