import React, { useMemo, useState, useContext } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegClock,
  FaRegCalendarCheck
} from 'react-icons/fa';
import EmptyTaskState from './EmptyTaskState.jsx';
import { AuthContext } from '../api/AuthContext.jsx';

const views = ['day', 'week', 'month'];

const formatDisplayDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatMonthYear = (date) => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const addMonths = (date, amount) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
};

const addWeeks = (date, amount) => addDays(date, amount * 7);

const getStartDayIndex = (startPref) => {
  const index = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(startPref);
  return index !== -1 ? index : 0;
};

const getDayLabels = (startPref) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const index = getStartDayIndex(startPref);
  return [...days.slice(index), ...days.slice(0, index)];
};

const startOfWeekDate = (date, startPref = 'sunday') => {
  const start = new Date(date);
  const day = start.getDay();
  const startPrefIndex = getStartDayIndex(startPref);
  const diff = (day - startPrefIndex + 7) % 7;
  start.setDate(start.getDate() - diff);
  return start;
};

const getWeekDays = (date, startPref) => {
  const start = startOfWeekDate(date, startPref);
  return Array.from({ length: 7 }).map((_, index) => addDays(start, index));
};

const getMonthGrid = (date, startPref) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startPrefIndex = getStartDayIndex(startPref);
  const startDayOffset = (start.getDay() - startPrefIndex + 7) % 7;
  const days = [];
  for (let i = 0; i < startDayOffset; i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= end.getDate(); day += 1) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }
  while (days.length % 7 !== 0) {
    days.push(null);
  }
  return days;
};

const getDateKey = (value) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high':
      return 'text-red-300';
    case 'medium':
      return 'text-yellow-300';
    case 'low':
      return 'text-green-300';
    case 'none':
      return 'text-gray-500';
    default:
      return 'text-gray-300';
  }
};

const Calendar = ({ tasks, onOpenModal, onEditTask }) => {
  const { user } = useContext(AuthContext);
  const startPref = user?.preferences?.startOfWeek || 'sunday';
  const timePref = user?.preferences?.timeFormat || '12h';

  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => getWeekDays(currentDate, startPref), [currentDate, startPref]);
  const monthGrid = useMemo(() => getMonthGrid(currentDate, startPref), [currentDate, startPref]);

  const activeTasks = useMemo(() => tasks.filter((task) => task.status !== 'completed'), [tasks]);

  const tasksByDate = useMemo(() => {
    return activeTasks.reduce((acc, task) => {
      if (!task.dueDate) return acc;
      const key = getDateKey(task.dueDate);
      if (!acc[key]) acc[key] = [];
      acc[key].push(task);
      return acc;
    }, {});
  }, [activeTasks]);

  const currentKey = getDateKey(currentDate);
  const currentDayTasks = tasksByDate[currentKey] || [];

  const weekBlocks = useMemo(() => {
    return weekDays.map((day) => {
      const key = getDateKey(day);
      return {
        day,
        tasks: tasksByDate[key] || []
      };
    });
  }, [weekDays, tasksByDate]);

  const upcomingTasks = useMemo(() => {
    const todayKey = getDateKey(new Date());
    return activeTasks
      .filter((task) => task.dueDate && getDateKey(task.dueDate) >= todayKey)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
  }, [activeTasks]);

  const handlePrevious = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, -1));
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, -1));
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, -1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate(addDays(currentDate, 1));
    if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className='space-y-6'>
      <header className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.3em] text-brand-primary'>Planner</p>
          <h1 className='text-2xl font-semibold text-white'>Calendar</h1>
          <p className='mt-2 text-xs text-gray-400 max-w-2xl'>Plan your day, week, and month with a clean schedule dashboard built for focus and priorities.</p>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
          <div className='inline-flex overflow-hidden rounded-md border border-neutral-800 bg-brand-bg text-sm font-medium'>
            {views.map((view) => (
              <button
                key={view}
                type='button'
                onClick={() => setViewMode(view)}
                className={`cursor-pointer px-4 py-2 transition ${viewMode === view ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-neutral-800 hover:text-white'}`}
              >
                {view}
              </button>
            ))}
          </div>
          <button
            type='button'
            onClick={handleToday}
            className='cursor-pointer inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-brand-bg px-4 py-2 text-sm text-gray-300 hover:border-brand-primary hover:text-white transition'
          >
            <FaRegCalendarCheck /> Today
          </button>
          <button
            type='button'
            onClick={() => onOpenModal(null, '')}
            className='cursor-pointer inline-flex items-center gap-2 rounded-md border border-brand-primary bg-brand-primary/10 px-4 py-2 text-sm text-brand-primary hover:bg-brand-primary/20 transition'
          >
            + Add Task
          </button>
        </div>
      </header>

      <div className='flex flex-col-reverse xl:flex-row gap-6'>
        <aside className='w-full xl:w-[300px] shrink-0 space-y-4 rounded-xl border border-neutral-800 bg-brand-surface p-5'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-[0.3em] text-gray-500'>Overview</p>
              <h2 className='text-lg font-semibold text-white'>Quick Stats</h2>
            </div>
            <FaRegClock className='text-brand-primary' />
          </div>

          <div className='grid gap-3'>
            <div className='rounded-xl border border-neutral-800 bg-brand-bg p-4'>
              <p className='text-xs uppercase tracking-[0.2em] text-gray-500'>Tasks today</p>
              <p className='mt-2 text-2xl font-semibold text-white'>{(tasksByDate[getDateKey(new Date())] || []).length}</p>
            </div>
            <div className='rounded-xl border border-neutral-800 bg-brand-bg p-4'>
              <p className='text-xs uppercase tracking-[0.2em] text-gray-500'>This week</p>
              <p className='mt-2 text-2xl font-semibold text-white'>{weekBlocks.reduce((sum, block) => sum + block.tasks.length, 0)}</p>
            </div>
          </div>

          <div className='rounded-xl border border-neutral-800 bg-brand-bg p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-[0.2em] text-gray-500'>Upcoming</p>
                <h3 className='text-sm font-semibold text-white'>Next tasks</h3>
              </div>
            </div>
            <div className='mt-4 space-y-3'>
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <button
                    key={task._id}
                    type='button'
                    onClick={() => onEditTask(task)}
                    className='cursor-pointer w-full rounded-lg border border-neutral-800 bg-brand-surface p-3 text-left text-sm text-gray-300 hover:border-brand-primary transition'
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <p className='font-semibold text-white'>{task.title}</p>
                      <span className={`text-[11px] uppercase font-semibold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    </div>
                    <p className='mt-1 text-[11px] text-gray-500'>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </button>
                ))
              ) : (
                <p className='text-sm text-gray-400'>No upcoming tasks.</p>
              )}
            </div>
          </div>

        </aside>

        <main className='flex-1 space-y-4 min-w-0'>
          <section className='flex flex-col gap-4 rounded-xl border border-neutral-800 bg-brand-surface p-4 md:p-6'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-400'>Current view</p>
                <h3 className='text-xl font-semibold text-white'>{viewMode === 'day' ? formatDisplayDate(currentDate) : viewMode === 'week' ? `${formatDisplayDate(weekDays[0])} — ${formatDisplayDate(weekDays[6])}` : formatMonthYear(currentDate)}</h3>
              </div>
              <div className='inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-brand-bg p-2'>
                <button type='button' onClick={handlePrevious} className='cursor-pointer rounded-md p-2 text-gray-400 transition hover:bg-neutral-800 hover:text-white'>
                  <FaChevronLeft />
                </button>
                <button type='button' onClick={handleNext} className='cursor-pointer rounded-md p-2 text-gray-400 transition hover:bg-neutral-800 hover:text-white'>
                  <FaChevronRight />
                </button>
              </div>
            </div>

            <div className='rounded-xl border border-neutral-800 bg-brand-bg p-2 md:p-4'>
              
              {/* DAY VIEW */}
              {viewMode === 'day' && (() => {
                const allDayTasks = currentDayTasks.filter(t => {
                  const d = new Date(t.dueDate);
                  return d.getHours() === 0 && d.getMinutes() === 0;
                });
                const scheduledTasks = currentDayTasks.filter(t => {
                  const d = new Date(t.dueDate);
                  return d.getHours() !== 0 || d.getMinutes() !== 0;
                }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

                return (
                  <div className='space-y-6 pt-2'>
                    {currentDayTasks.length === 0 ? (
                      <EmptyTaskState 
                        title="A clear schedule!" 
                        description="You have no tasks scheduled for this day." 
                        onAdd={() => onOpenModal(null, getDateKey(currentDate))} 
                      />
                    ) : (
                      <>
                        {/* All Day Section */}
                        {allDayTasks.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">All Day</h4>
                            <div className="grid gap-2">
                              {allDayTasks.map((task) => (
                                <button
                                  key={task._id}
                                  type='button'
                                  onClick={() => onEditTask(task)}
                                className='cursor-pointer w-full rounded-xl border border-neutral-800 bg-brand-surface p-3 text-left transition hover:border-brand-primary shadow-sm'
                                >
                                  <div className='flex items-center justify-between gap-3'>
                                    <span className='font-semibold text-gray-200'>{task.title}</span>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Hourly Timeline Section */}
                        {scheduledTasks.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-1">Timeline</h4>
                            <div className="space-y-3">
                              {scheduledTasks.map(task => {
                                const d = new Date(task.dueDate);
                                const timeString = d.toLocaleTimeString('en-US', { 
                                  hour: timePref === '24h' ? '2-digit' : 'numeric', 
                                  minute: '2-digit',
                                  hour12: timePref !== '24h'
                                });
                                return (
                                  <div key={task._id} className="flex gap-3 sm:gap-4 items-start">
                                    <div className="w-16 shrink-0 text-right pt-3">
                                      <span className="text-[11px] font-bold text-brand-primary">{timeString}</span>
                                    </div>
                                    <div className="flex-1">
                                      <button
                                        type='button'
                                        onClick={() => onEditTask(task)}
                                      className='cursor-pointer w-full rounded-xl border border-neutral-800 bg-brand-surface p-3 text-left transition hover:border-brand-primary shadow-sm'
                                      >
                                        <div className='flex items-center justify-between gap-3'>
                                          <span className='font-semibold text-gray-200'>{task.title}</span>
                                          <span className={`text-[10px] uppercase tracking-wider font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                        </div>
                                        {task.description && <p className='mt-2 text-xs text-gray-500 truncate'>{task.description}</p>}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })()}

              {/* WEEK VIEW */}
              {viewMode === 'week' && (
                <div className='flex flex-col gap-3'>
                  {weekBlocks.map((block) => {
                    const isToday = getDateKey(block.day) === getDateKey(new Date());
                    return (
                      <div
                        key={block.day.toString()}
                        className='rounded-xl border border-neutral-800 bg-brand-bg p-4 cursor-pointer hover:border-neutral-700 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center'
                        onClick={() => onOpenModal(null, getDateKey(block.day))}
                      >
                        <div className='flex sm:flex-col items-center justify-between sm:justify-center sm:w-16 shrink-0'>
                          <p className={`text-[10px] uppercase tracking-widest font-bold ${isToday ? 'text-brand-primary' : 'text-gray-500'}`}>{block.day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className={`text-2xl font-black ${isToday ? 'text-brand-primary' : 'text-gray-200'}`}>{block.day.getDate()}</p>
                        </div>
                        <div className='flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 border-t sm:border-t-0 sm:border-l border-neutral-800 pt-3 sm:pt-0 sm:pl-5'>
                          {block.tasks.length > 0 ? (
                            block.tasks.slice(0, 4).map((task) => (
                              <button
                                key={task._id}
                                type='button'
                                onClick={(e) => { e.stopPropagation(); onEditTask(task) }}
                                className='cursor-pointer w-full rounded-lg border border-neutral-800 bg-brand-surface px-3 py-2 text-left hover:bg-neutral-800 transition'
                              >
                                <div className='flex items-center justify-between gap-2'>
                                  <p className='text-xs font-semibold text-gray-200 truncate'>{task.title}</p>
                                  <span className={`text-[9px] uppercase font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                </div>
                              </button>
                            ))
                          ) : (
                            <p className='text-xs text-gray-600 font-medium flex items-center h-full'>No tasks scheduled</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MONTH VIEW */}
              {viewMode === 'month' && (
                <div className='grid gap-2'>
                  <div className='grid grid-cols-7 gap-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1'>
                    {getDayLabels(startPref).map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className='grid gap-1 sm:gap-2 grid-cols-7'>
                    {monthGrid.map((day, index) => {
                      const dayKey = day ? getDateKey(day) : null;
                      const isToday = dayKey === getDateKey(new Date());
                      const tasksForDay = day ? tasksByDate[dayKey] || [] : [];
                      
                      return (
                        <div
                          key={index}
                          className={`min-h-[80px] sm:min-h-[100px] rounded-xl border sm:p-2 text-left transition-all ${day ? 'cursor-pointer bg-brand-bg border-neutral-800 hover:border-neutral-700' : 'border-transparent'}`}
                          onClick={() => day && onOpenModal(null, dayKey)}
                        >
                          {day && (
                            <div className="flex flex-col h-full p-1 sm:p-0">
                              <div className='flex items-start justify-between mb-1.5'>
                                <span className={`text-xs font-semibold ${isToday ? 'bg-brand-primary text-white w-5 h-5 flex items-center justify-center rounded-full shadow-md' : 'text-gray-400'}`}>
                                  {day.getDate()}
                                </span>
                                <div className="flex flex-wrap justify-end gap-0.5 mt-0.5 max-w-[50%]">
                                  {Array.from(new Set(tasksForDay.map(t => t.priority))).map(p => (
                                     <span key={p} className={`h-1.5 w-1.5 rounded-full ${p === 'none' ? 'bg-neutral-600' : p === 'high' ? 'bg-red-400' : p === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                                  ))}
                                </div>
                              </div>
                              
                              <div className='space-y-1 flex-1 hidden sm:block'>
                                {tasksForDay.slice(0, 2).map(t => (
                                   <div key={t._id} className="truncate text-[9px] font-medium text-gray-300 bg-brand-surface px-1.5 py-0.5 rounded border border-neutral-700">
                                      {t.title}
                                   </div>
                                ))}
                                {tasksForDay.length > 2 && (
                                   <div className="text-[9px] text-gray-500 font-bold pl-0.5">+{tasksForDay.length - 2} more</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Calendar;
