import React, { useMemo, useState } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegClock,
  FaRegCalendarCheck
} from 'react-icons/fa';

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

const startOfWeek = (date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = (day + 6) % 7;
  start.setDate(start.getDate() - diff);
  return start;
};

const getWeekDays = (date) => {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }).map((_, index) => addDays(start, index));
};

const getMonthGrid = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const startDay = (start.getDay() + 6) % 7;
  const days = [];
  for (let i = 0; i < startDay; i += 1) {
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
    default:
      return 'text-gray-300';
  }
};

const Calendar = ({ tasks, onOpenModal, onEditTask }) => {
  const [viewMode, setViewMode] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const monthGrid = useMemo(() => getMonthGrid(currentDate), [currentDate]);

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
          <div className='inline-flex overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 text-sm font-medium'>
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
            className='cursor-pointer inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-4 py-2 text-sm text-gray-300 hover:border-brand-primary hover:text-white transition'
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

      <div className='grid gap-4 xl:grid-cols-[280px_1fr]'>
        <aside className='space-y-4 rounded-md border border-neutral-800 bg-neutral-950 p-4'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-[0.3em] text-gray-500'>Overview</p>
              <h2 className='text-lg font-semibold text-white'>Today's view</h2>
            </div>
            <FaRegClock className='text-brand-primary' />
          </div>

          <div className='grid gap-3'>
            <div className='rounded-md border border-neutral-800 bg-neutral-900 p-3'>
              <p className='text-xs uppercase tracking-[0.2em] text-gray-500'>Tasks today</p>
              <p className='mt-2 text-2xl font-semibold text-white'>{(tasksByDate[getDateKey(new Date())] || []).length}</p>
            </div>
            <div className='rounded-md border border-neutral-800 bg-neutral-900 p-3'>
              <p className='text-xs uppercase tracking-[0.2em] text-gray-500'>This week</p>
              <p className='mt-2 text-2xl font-semibold text-white'>{weekBlocks.reduce((sum, block) => sum + block.tasks.length, 0)}</p>
            </div>
          </div>

          <div className='rounded-md border border-neutral-800 bg-neutral-900 p-3'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-xs uppercase tracking-[0.2em] text-gray-500'>Upcoming</p>
                <h3 className='text-sm font-semibold text-white'>Next tasks</h3>
              </div>
            </div>
            <div className='mt-3 space-y-3'>
              {upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <button
                    key={task._id}
                    type='button'
                    onClick={() => onEditTask(task)}
                    className='cursor-pointer w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-left text-sm text-gray-300 hover:border-brand-primary'
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

        <main className='space-y-4'>
          <section className='flex flex-col gap-4 rounded-md border border-neutral-800 bg-neutral-950 p-4'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <p className='text-sm text-gray-400'>Current view</p>
                <h3 className='text-xl font-semibold text-white'>{viewMode === 'day' ? formatDisplayDate(currentDate) : viewMode === 'week' ? `${formatDisplayDate(weekDays[0])} — ${formatDisplayDate(weekDays[6])}` : formatMonthYear(currentDate)}</h3>
              </div>
              <div className='inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 p-2'>
                <button type='button' onClick={handlePrevious} className='cursor-pointer rounded-md p-2 text-gray-400 transition hover:bg-neutral-800 hover:text-white'>
                  <FaChevronLeft />
                </button>
                <button type='button' onClick={handleNext} className='cursor-pointer rounded-md p-2 text-gray-400 transition hover:bg-neutral-800 hover:text-white'>
                  <FaChevronRight />
                </button>
              </div>
            </div>

            <div className='rounded-md border border-neutral-800 bg-neutral-900 p-4'>
              {viewMode === 'day' && (
                <div className='space-y-4'>
                  {currentDayTasks.length > 0 ? (
                    currentDayTasks.map((task) => (
                      <button
                        key={task._id}
                        type='button'
                        onClick={() => onEditTask(task)}
                        className='cursor-pointer w-full rounded-md border border-neutral-800 bg-neutral-950 p-3 text-left transition hover:border-brand-primary'
                      >
                        <div className='flex items-center justify-between gap-3'>
                          <span className='font-semibold text-white'>{task.title}</span>
                          <span className={`text-[11px] uppercase font-semibold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                        </div>
                        {task.description && <p className='mt-2 text-sm text-gray-400'>{task.description}</p>}
                      </button>
                    ))
                  ) : (
                    <button
                      type='button'
                      onClick={() => onOpenModal(null, getDateKey(currentDate))}
                      className='rounded-md border border-dashed border-neutral-700 bg-neutral-950 p-6 text-center text-sm text-gray-400 w-full hover:border-brand-primary'
                    >
                      No tasks scheduled for this day. Click to add one.
                    </button>
                  )}
                </div>
              )}

              {viewMode === 'week' && (
                <div className='grid gap-4 lg:grid-cols-2'>
                  {weekBlocks.map((block) => (
                    <div
                      key={block.day.toString()}
                      className='rounded-md border border-neutral-800 bg-neutral-950 p-4 cursor-pointer'
                      onClick={() => onOpenModal(null, getDateKey(block.day))}
                    >
                      <div className='flex items-center justify-between'>
                        <div>
                          <p className='text-sm text-gray-400'>{block.day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className='text-lg font-semibold text-white'>{block.day.getDate()}</p>
                        </div>
                        <span className='text-sm text-gray-400'>{block.tasks.length} tasks</span>
                      </div>
                      <div className='mt-4 space-y-2'>
                        {block.tasks.length > 0 ? (
                          block.tasks.slice(0, 2).map((task) => (
                            <button
                              key={task._id}
                              type='button'
                              onClick={(e) => { e.stopPropagation(); onEditTask(task) }}
                              className='cursor-pointer w-full rounded-md border border-neutral-800 bg-neutral-900 p-3 text-left text-sm text-gray-300 hover:border-brand-primary'
                            >
                              <div className='flex items-center justify-between gap-2'>
                                <p className='font-semibold text-white'>{task.title}</p>
                                <span className={`text-[11px] uppercase font-semibold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className='text-sm text-gray-400'>No tasks</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'month' && (
                <div className='grid gap-2'>
                  <div className='grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.2em] text-gray-500'>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                  <div className='grid gap-2 sm:grid-cols-7'>
                    {monthGrid.map((day, index) => {
                      const tasksForDay = day ? tasksByDate[getDateKey(day)] || [] : [];
                      return (
                        <div
                          key={index}
                          className={`min-h-20 rounded-md border border-neutral-800 p-3 text-left cursor-pointer ${day && day.getMonth() === currentDate.getMonth() ? 'bg-neutral-950' : 'bg-neutral-900 text-gray-600'}`}
                          onClick={() => day && onOpenModal(null, getDateKey(day))}
                        >
                          {day ? (
                            <>
                              <div className='flex items-center justify-between text-sm text-white'>
                                <span>{day.getDate()}</span>
                                <span className='inline-flex h-2 w-2 rounded-md bg-brand-primary' />
                              </div>
                              {tasksForDay.length > 0 && (
                                <div className='mt-3 rounded-md bg-brand-primary/10 px-2 py-1 text-[11px] font-medium text-white'>
                                  {tasksForDay.length} task{tasksForDay.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </>
                          ) : null}
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
