import React from 'react';
import TaskCard from './TaskCard.jsx';
import EmptyTaskState from './EmptyTaskState.jsx';
import TaskFilterMenu from './TaskFilterMenu.jsx';
import TaskSortMenu from './TaskSortMenu.jsx';

const MyTasks = ({ title = 'My Tasks', tasks, isLoading, error, onOpenModal, onEditTask, onToggleComplete, onDeleteTask, filters, setFilters, allLists, sortBy, setSortBy }) => {
  const hasActiveFilters = filters && (filters.priority !== 'all' || filters.status !== 'all' || filters.list !== 'all');

  return (
    <div className='w-full max-w-3xl mx-auto mt-16'>
      {(tasks.length > 0 || isLoading || hasActiveFilters) && (
        <div className='flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between'>
          
          <div className='inline-flex items-center bg-neutral-950/30 border border-neutral-800/60 rounded-xl shadow-sm'>
            <div className='flex items-center px-4 py-2 border-r border-neutral-800/60 rounded-l-xl bg-neutral-900/20'>
              <h1 className='text-white text-lg font-semibold tracking-wide'>{title}</h1>
            </div>
            
            {filters && (
              <>
                <TaskFilterMenu 
                  filters={filters} 
                  setFilters={setFilters} 
                  allLists={allLists} 
                  showListFilter={true} 
                />
                <div className='w-[1px] h-5 bg-neutral-800/80'></div>
              </>
            )}
            
            <TaskSortMenu sortBy={sortBy} setSortBy={setSortBy} />
          </div>

          <button
            onClick={() => onOpenModal()}
            className='bg-brand-primary px-4 py-2.5 rounded-lg text-white text-sm font-semibold cursor-pointer hover:bg-brand-primary/90 transition-all shadow-sm active:scale-[0.98] shrink-0'
            aria-label='Add task'
          >
            + Add Task
          </button>
        </div>
      )}

      {error && (
        <div className='mt-4 rounded-md border border-red-600 bg-red-950 p-4 text-sm text-red-300'>
          {error}
        </div>
      )}

      <div className='mt-6 space-y-3'>
        {isLoading ? (
          <div className='bg-brand-surface p-4 rounded-md text-gray-400'>Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <EmptyTaskState 
            title="All caught up!" 
            description="You have no tasks here right now. Take a break, or add a new task to your list." 
            onAdd={() => onOpenModal()} 
          />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MyTasks;
