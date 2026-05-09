import { useState, useEffect, useRef } from 'react';
import { FaRegCalendarAlt } from 'react-icons/fa';

const padDate = (value) => String(value).padStart(2, '0');
const toLocalISODate = (date) => `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`;
const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const TaskModal = ({ isOpen, onClose, onSave, editingTask, error, defaultDate = '', customLists = [], activeTab = 'tasks' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    priority: 'medium',
    list: 'Personal'
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showListPicker, setShowListPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  
  const listRef = useRef(null);
  const dateRef = useRef(null);
  const priorityRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editingTask?.title || '',
        description: editingTask?.description || '',
        date: editingTask?.dueDate ? (() => {
          const date = parseDateString(editingTask.dueDate);
          return date ? toLocalISODate(date) : defaultDate;
        })() : defaultDate,
        priority: editingTask?.priority || 'medium',
        list: editingTask?.list || (
          activeTab !== 'tasks' && activeTab !== 'today' && activeTab !== 'calendar' ? activeTab : 'Personal'
        )
      });
      setLocalError('');
      setShowDatePicker(false);
      setShowPriorityPicker(false);
      setShowListPicker(false);
    }
  }, [isOpen, editingTask, defaultDate]);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listRef.current && !listRef.current.contains(event.target)) {
        setShowListPicker(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
      if (priorityRef.current && !priorityRef.current.contains(event.target)) {
        setShowPriorityPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust so Monday is 0, Sunday is 6
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setFormData((prev) => ({
      ...prev,
      date: toLocalISODate(selectedDate)
    }));
    setShowDatePicker(false);
  };

  const handleQuickSelect = (offset) => {
    const date = new Date();
    if (offset === 'tomorrow') {
      date.setDate(date.getDate() + 1);
    } else if (offset === 'nextweek') {
      date.setDate(date.getDate() + 7);
    }
    setFormData((prev) => ({
      ...prev,
      date: toLocalISODate(date)
    }));
    setShowDatePicker(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className='text-gray-700 text-sm text-center py-1.5'></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = toLocalISODate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
      const isSelected = formData.date === dateStr;
      const isToday = dateStr === toLocalISODate(new Date());

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`text-sm py-1.5 rounded-md transition-all cursor-pointer font-medium ${
            isSelected
              ? 'bg-brand-primary text-white shadow-md'
              : isToday
              ? 'bg-neutral-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-neutral-800'
          }`}
        >
          {day}
        </button>
      );
    }

    return { days, monthYear };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');

    if (!formData.name.trim() || !formData.date) {
      setLocalError('Task name and date are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        title: formData.name.trim(),
        description: formData.description.trim(),
        dueDate: formData.date,
        priority: formData.priority,
        list: formData.list
      });
    } catch (submitError) {
      setLocalError(submitError?.response?.data?.message || `Could not ${editingTask ? 'update' : 'create'} task`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isMounted) return null;

  // Only calculate calendar logic once per render, and only if the popover is open
  const calendarData = showDatePicker ? renderCalendar() : { days: [], monthYear: '' };

  return (
    <div className={`fixed inset-0 z-20 bg-black/50 flex items-center justify-center p-4 backdrop-blur-[2px] transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`w-full max-w-xl bg-neutral-900 border border-neutral-800/60 rounded-xl shadow-2xl transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/50 rounded-t-xl'>
          <h2 className='text-white text-base font-semibold'>Task Details</h2>
          <button
            type='button'
            onClick={handleClose}
            className='text-gray-500 hover:text-white bg-neutral-800/50 hover:bg-neutral-700/50 h-8 w-8 rounded-full flex items-center justify-center transition cursor-pointer'
            aria-label='Close task form'
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className='p-6 space-y-5'>
          {/* Title Input */}
          <div>
            <input
              id='taskName'
              name='name'
              value={formData.name}
              onChange={handleInputChange}
              type='text'
              placeholder='Add task title...'
              className='w-full text-white text-2xl font-medium outline-none bg-transparent placeholder-neutral-600 transition-colors focus:placeholder-neutral-500'
            />
          </div>

          {/* List Selector */}
          <div className='relative z-30' ref={listRef}>
            <button
              type='button'
              onClick={() => {
                setShowListPicker(!showListPicker);
                setShowDatePicker(false);
                setShowPriorityPicker(false);
              }}
              className='text-sm text-brand-primary/80 font-medium hover:text-brand-primary transition-colors cursor-pointer flex items-center gap-1'
            >
              My lists • {formData.list}
              <span className='text-[10px] opacity-70'>▼</span>
            </button>

            <div
              className={`absolute left-0 top-full mt-2 w-40 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl p-1.5 shadow-2xl transition-all duration-300 origin-top-left ${
                showListPicker
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
            >
              {[
                { name: 'Personal' },
                { name: 'Work' },
                { name: 'Study' },
                ...customLists.filter(l => l.name !== 'Personal' && l.name !== 'Work' && l.name !== 'Study')
              ].map((list) => (
                <button
                  key={list._id || list.name}
                  type='button'
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, list: list.name }));
                    setShowListPicker(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                    formData.list === list.name
                      ? 'bg-brand-primary/20 text-brand-primary font-medium'
                      : 'text-gray-400 hover:bg-neutral-800/50 hover:text-white'
                  }`}
                >
                  {list.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Priority Section */}
          <div className='border-b border-neutral-800/60 py-3 flex items-center gap-3'>
            {/* Date Button & Popover */}
            <div className='relative z-20' ref={dateRef}>
              <button
                type='button'
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  setShowPriorityPicker(false);
                  setShowListPicker(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 text-sm font-medium cursor-pointer ${
                  showDatePicker
                    ? 'bg-brand-primary/10 border-brand-primary/50 text-brand-primary shadow-sm'
                    : 'bg-neutral-800/50 border-neutral-700/50 text-gray-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                <FaRegCalendarAlt className={showDatePicker ? 'text-brand-primary' : 'text-gray-400'} />
                {formData.date
                  ? new Date(formData.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Set Date'}
              </button>

              <div
                className={`absolute left-0 top-full mt-2 w-70 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl p-4 shadow-2xl transition-all duration-300 origin-top-left ${
                  showDatePicker
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                {/* Month navigation */}
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-sm text-white font-semibold'>
                    {calendarData.monthYear}
                  </h3>
                  <div className='flex gap-1'>
                    <button
                      type='button'
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                        )
                      }
                      className='h-7 w-7 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded transition text-lg cursor-pointer'
                    >
                      ‹
                    </button>
                    <button
                      type='button'
                      onClick={() =>
                        setCurrentMonth(
                          new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                        )
                      }
                      className='h-7 w-7 flex items-center justify-center text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded transition text-lg cursor-pointer'
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Calendar grid header */}
                <div className='grid grid-cols-7 gap-1 mb-1'>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className='text-gray-500 text-[10px] font-bold tracking-wide text-center py-1.5'>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className='grid grid-cols-7 gap-1 mb-3'>
                  {calendarData.days}
                </div>

                {/* Quick select buttons */}
                <div className='space-y-0.5 pt-3 border-t border-neutral-800/80'>
                  <button
                    type='button'
                    onClick={() => handleQuickSelect('tomorrow')}
                    className='w-full text-left text-sm text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 px-2 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-2'
                  >
                    Tomorrow
                  </button>
                  <button
                    type='button'
                    onClick={() => handleQuickSelect('nextweek')}
                    className='w-full text-left text-sm text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 px-2 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-2'
                  >
                    Next week
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, date: '' }));
                      setShowDatePicker(false);
                    }}
                    className='w-full text-left text-sm text-gray-400 hover:text-brand-primary hover:bg-brand-primary/5 px-2 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-2'
                  >
                    No Date
                  </button>
                </div>
              </div>
            </div>

            {/* Priority Button & Popover */}
            <div className='relative z-10' ref={priorityRef}>
              <button
                type='button'
                onClick={() => {
                  setShowPriorityPicker(!showPriorityPicker);
                  setShowDatePicker(false);
                  setShowListPicker(false);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 text-sm font-medium capitalize cursor-pointer ${
                  showPriorityPicker
                    ? 'bg-neutral-800/80 border-neutral-600 text-white shadow-sm'
                    : 'bg-neutral-800/50 border-neutral-700/50 text-gray-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    formData.priority === 'high'
                      ? 'bg-red-400'
                      : formData.priority === 'medium'
                      ? 'bg-yellow-400'
                      : 'bg-green-400'
                  }`}
                />
                {formData.priority}
              </button>

              <div
                className={`absolute left-0 top-full mt-2 w-32 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl p-1.5 shadow-2xl transition-all duration-300 origin-top-left ${
                  showPriorityPicker
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                {['high', 'medium', 'low'].map((priority) => (
                  <button
                    key={priority}
                    type='button'
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, priority }));
                      setShowPriorityPicker(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 text-sm capitalize rounded-lg transition-colors cursor-pointer ${
                      formData.priority === priority
                        ? 'bg-neutral-800 text-white font-medium'
                        : 'text-gray-400 hover:bg-neutral-800/50 hover:text-white'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        priority === 'high'
                          ? 'bg-red-400'
                          : priority === 'medium'
                          ? 'bg-yellow-400'
                          : 'bg-green-400'
                      }`}
                    />
                    {priority}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <textarea
              id='taskDescription'
              name='description'
              value={formData.description}
              onChange={handleInputChange}
              placeholder='Add description...'
              className='w-full p-0 rounded-none bg-transparent text-gray-300 text-base outline-none placeholder-neutral-600 resize-none min-h-25 border-0 focus:ring-0'
            />
          </div>

          {(error || localError) && <p className='text-red-400 text-sm font-medium bg-red-400/10 p-2 rounded border border-red-400/20'>{error || localError}</p>}

          {/* Save Button */}
          <div className='flex justify-end mt-32'>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-8 py-2.5 cursor-pointer bg-brand-primary text-white text-sm font-semibold rounded-lg hover:bg-brand-primary/90 shadow-lg hover:shadow-brand-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
            >
              {isSubmitting ? 'Saving…' : editingTask ? 'Update Task' : 'Save Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;