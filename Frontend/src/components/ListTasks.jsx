import React from 'react';
import TaskCard from './TaskCard.jsx';

const ListTasks = ({ listName, tasks, isLoading, error, onOpenModal, onEditTask, onToggleComplete, onDeleteTask }) => {
  return (
    <div className='w-full max-w-3xl mx-auto mt-16'>
      <div className='flex items-center justify-between'>
        <h1 className='text-white text-2xl font-semibold capitalize'>{listName}</h1>
        <button
          onClick={() => onOpenModal()}
          className='bg-brand-primary p-2 rounded-md text-white text-sm cursor-pointer hover:bg-brand-primary/90 transition'
          aria-label={`Add task to ${listName}`}
        >
          + Add Task
        </button>
      </div>

      {error && (
        <div className='mt-4 rounded-md border border-red-600 bg-red-950 p-4 text-sm text-red-300'>
          {error}
        </div>
      )}

      <div className='mt-6 space-y-3'>
        {isLoading ? (
          <div className='bg-brand-surface p-4 rounded-md text-gray-400'>Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className='bg-brand-surface p-4 rounded-md text-gray-400'>
            No tasks in "{listName}" yet. Click + Add Task to create your first task here.
          </div>
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

export default ListTasks;