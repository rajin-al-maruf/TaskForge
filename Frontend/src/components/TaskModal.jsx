import { useState, useEffect, useRef, useContext } from 'react';
import { FaRegCalendarAlt, FaTimes, FaRegClock } from 'react-icons/fa';
import DatePicker from './DatePicker.jsx';
import { AuthContext } from '../api/AuthContext.jsx';

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

const timeOptions = Array.from({ length: 24 * 4 }).map((_, i) => {
  const h = Math.floor(i / 4);
  const m = (i % 4) * 15;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
});

const formatDisplayTime = (timeStr, format = '12h') => {
  if (!timeStr) return '';
  if (format === '24h') return timeStr;
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const TaskModal = ({ isOpen, onClose, onSave, editingTask, error, defaultDate = '', customLists = [], activeTab = 'tasks' }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    priority: 'none',
    list: 'Personal',
    timeEstimate: 25,
    subtasks: []
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPriorityPicker, setShowPriorityPicker] = useState(false);
  const [showListPicker, setShowListPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  
  const { user } = useContext(AuthContext);
  const isProUser = user?.userType === 'pro';
  const timePref = user?.preferences?.timeFormat || '12h';
  const listRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const priorityRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      let initialDate = defaultDate;
      let initialTime = '';
      
      if (editingTask?.dueDate) {
        const dateObj = parseDateString(editingTask.dueDate);
        if (dateObj) {
          initialDate = toLocalISODate(dateObj);
          if (dateObj.getHours() !== 0 || dateObj.getMinutes() !== 0) {
            initialTime = `${padDate(dateObj.getHours())}:${padDate(dateObj.getMinutes())}`;
          }
        }
      }

      setFormData({
        name: editingTask?.title || '',
        description: editingTask?.description || '',
        date: initialDate,
        time: initialTime,
        priority: editingTask?.priority || 'none',
        list: editingTask?.list || (
          activeTab !== 'tasks' && activeTab !== 'today' && activeTab !== 'calendar' ? activeTab : 'Personal'
        ),
        timeEstimate: editingTask?.timeEstimate || 25,
        subtasks: editingTask?.subtasks || []
      });
      setLocalError('');
      setShowDatePicker(false);
      setShowTimePicker(false);
      setShowPriorityPicker(false);
      setShowListPicker(false);
      setNewSubtask('');
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
      if (timeRef.current && !timeRef.current.contains(event.target)) {
        setShowTimePicker(false);
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError('');

    if (!formData.name.trim() || !formData.date) {
      setLocalError('Task name and date are required.');
      return;
    }

    setIsSubmitting(true);

    let combinedDate = formData.date;
    if (formData.date) {
      const d = parseDateString(formData.date);
      if (formData.time) {
        const [hours, minutes] = formData.time.split(':').map(Number);
        d.setHours(hours, minutes, 0, 0);
      } else {
        d.setHours(0, 0, 0, 0);
      }
      combinedDate = d.toISOString();
    }

    try {
      await onSave({
        title: formData.name.trim(),
        description: formData.description.trim(),
        dueDate: combinedDate,
        priority: formData.priority,
        list: formData.list,
        timeEstimate: Number(formData.timeEstimate) || 25,
        subtasks: formData.subtasks
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

  return (
    <div className={`fixed inset-0 z-[60] bg-black/50 flex p-4 overflow-y-auto backdrop-blur-[2px] transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`w-full max-w-xl bg-neutral-900 border border-neutral-800/60 rounded-xl shadow-2xl transition-all duration-300 m-auto ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
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
                setShowTimePicker(false);
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
            {/* Date Popover */}
            <div className='relative z-20' ref={dateRef}>
              <button
                type='button'
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  setShowTimePicker(false);
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
                  ? new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Set Date'}
              </button>

              <DatePicker 
                isOpen={showDatePicker} 
                date={formData.date} 
                onChange={(val) => setFormData((prev) => ({ ...prev, date: val }))} 
                onClose={() => setShowDatePicker(false)} 
              />
            </div>

            {/* Time Popover */}
            <div className='relative z-20' ref={timeRef}>
              <button
                type='button'
                onClick={() => {
                  if (!formData.date) return;
                  setShowTimePicker(!showTimePicker);
                  setShowDatePicker(false);
                  setShowPriorityPicker(false);
                  setShowListPicker(false);
                }}
                disabled={!formData.date}
                title='Optional: Set a time'
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 text-sm font-medium cursor-pointer ${
                  !formData.date 
                    ? 'opacity-50 cursor-not-allowed bg-neutral-900 border-neutral-800 text-gray-600'
                    : formData.time
                    ? 'bg-brand-primary/10 border-brand-primary/50 text-brand-primary shadow-sm'
                    : 'bg-neutral-800/50 border-neutral-700/50 text-gray-300 hover:bg-neutral-700 hover:text-white'
                }`}
              >
                <FaRegClock className={formData.time ? 'text-brand-primary' : 'text-gray-400'} />
                {formData.time ? formatDisplayTime(formData.time, timePref) : 'Time'}
              </button>

              <div
                className={`absolute left-0 top-full mt-2 w-40 bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl p-1.5 shadow-2xl transition-all duration-300 origin-top-left max-h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] z-50 ${
                  showTimePicker
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <button
                  type='button'
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, time: '' }));
                    setShowTimePicker(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                    !formData.time
                      ? 'bg-brand-primary/20 text-brand-primary font-medium'
                      : 'text-gray-400 hover:bg-neutral-800/50 hover:text-white'
                  }`}
                >
                  No Time
                </button>
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    type='button'
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, time }));
                      setShowTimePicker(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                      formData.time === time
                        ? 'bg-brand-primary/20 text-brand-primary font-medium'
                        : 'text-gray-400 hover:bg-neutral-800/50 hover:text-white'
                    }`}
                  >
                    {formatDisplayTime(time, timePref)}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Button & Popover */}
            <div className='relative z-10' ref={priorityRef}>
              <button
                type='button'
                onClick={() => {
                  setShowPriorityPicker(!showPriorityPicker);
                  setShowDatePicker(false);
                  setShowTimePicker(false);
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
                    formData.priority === 'none'
                      ? 'bg-neutral-600'
                      : formData.priority === 'high'
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
                {['none', 'high', 'medium', 'low'].map((priority) => (
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
                        priority === 'none'
                          ? 'bg-neutral-600'
                          : priority === 'high'
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

          {/* Time & Subtasks */}
          {isProUser && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-neutral-800/60 pt-5'>
              <div>
                <label className='text-[10px] font-bold tracking-widest text-gray-500 block mb-2'>FOCUS TIME</label>
                <div className='flex items-center gap-2 bg-neutral-950 border border-neutral-800/80 rounded-lg px-3 py-2'>
                  <input
                    type='number'
                    name='timeEstimate'
                    value={formData.timeEstimate}
                    onChange={handleInputChange}
                    min="1"
                    max="240"
                    className='w-full bg-transparent text-white text-sm outline-none'
                  />
                  <span className='text-gray-500 text-xs font-medium'>minutes</span>
                </div>
              </div>
              <div>
                <label className='text-[10px] font-bold tracking-widest text-gray-500 block mb-2'>SUB-TASKS</label>
                <input 
                  type="text" 
                  value={newSubtask} 
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if(e.key === 'Enter') {
                      e.preventDefault();
                      if(newSubtask.trim()) {
                        setFormData(prev => ({...prev, subtasks: [...prev.subtasks, { title: newSubtask.trim(), completed: false }]}));
                        setNewSubtask('');
                      }
                    }
                  }}
                  placeholder="Type subtask and press enter..." 
                  className="w-full text-sm text-gray-300 bg-neutral-950 border border-neutral-800/80 rounded-lg px-3 py-2 outline-none focus:border-brand-primary transition-colors placeholder-neutral-600"
                />
                {formData.subtasks.length > 0 && (
              <div className='space-y-2 mt-3'>
                    {formData.subtasks.map((st, idx) => (
                      <div key={idx} className='flex items-center gap-3 bg-neutral-950 border border-neutral-800/50 rounded-lg px-3 py-2 group'>
                        <input
                          type='checkbox'
                          checked={st.completed}
                          onChange={() => {
                            const newSt = [...formData.subtasks];
                            newSt[idx].completed = !newSt[idx].completed;
                            setFormData(prev => ({...prev, subtasks: newSt}));
                          }}
                          className='w-3.5 h-3.5 rounded border-neutral-700 text-brand-primary focus:ring-brand-primary bg-neutral-900 cursor-pointer'
                        />
                        <span className={`text-sm text-gray-300 flex-1 truncate ${st.completed ? 'line-through opacity-50' : ''}`}>{st.title}</span>
                        <button type="button" onClick={() => {
                           setFormData(prev => ({...prev, subtasks: prev.subtasks.filter((_, i) => i !== idx)}));
                        }} className="text-gray-600 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all cursor-pointer"><FaTimes size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {(error || localError) && <p className='text-red-400 text-sm font-medium bg-red-400/10 p-2 rounded border border-red-400/20'>{error || localError}</p>}

          {/* Save Button */}
          <div className='flex justify-end mt-8'>
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