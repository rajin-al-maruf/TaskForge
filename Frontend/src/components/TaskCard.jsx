import React from 'react';
import { FaRegCircle, FaRegCheckCircle, FaTimes, FaRegCalendarAlt } from 'react-icons/fa';

const priorityCircleColors = {
  high: 'text-red-300',
  medium: 'text-yellow-300',
  low: 'text-green-300',
  none: 'text-gray-500'
};

const formatTaskDate = (dateStr) => {
  const d = new Date(dateStr);
  const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
  const timeString = hasTime ? ` • ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : '';
  return dateString + timeString;
};

const TaskCard = ({ task, onToggleComplete, onDelete, onEdit }) => {
  const completed = task.status === 'completed';

  return (
    <div
      className={`p-4 rounded-md flex items-start justify-between gap-4 cursor-pointer group relative ${
        completed ? 'bg-brand-surface/20 border border-neutral-800' : 'bg-brand-surface hover:bg-neutral-800'
      }`}
      onClick={() => onEdit(task)}
    >
      <div className='flex items-start gap-4'>
        <div className='flex items-start gap-3'>
          <div>
            {completed ? (
              <FaRegCheckCircle
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task);
                }}
                className='h-5 w-5 mt-0.5 text-gray-600 cursor-pointer'
              />
            ) : (
              <FaRegCircle
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete(task);
                }}
                className={`h-5 w-5 mt-0.5 ${priorityCircleColors[task.priority] || 'text-gray-400'} cursor-pointer`}
              />
            )}
          </div>
          <div>
            <h2 className={`text-sm ${completed ? 'text-gray-600' : 'text-white'}`}>
              {task.title}
            </h2>
            <p className={`text-xs ${completed ? 'text-gray-600' : 'text-gray-400'}`}>
              {task.description || ''}
            </p>
            <div className='text-xs text-gray-500 mt-3 flex items-center gap-2'>
              <FaRegCalendarAlt className={`${completed ? 'text-gray-600' : 'text-brand-primary'}`} />
              <p className={`${completed ? 'text-gray-600' : ''}`}>
                {task.dueDate ? formatTaskDate(task.dueDate) : 'No date'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task._id);
        }}
        className={`${completed? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 text-gray-400 hover:text-brand-primary transition-opacity duration-200 cursor-pointer`}
        aria-label='Delete task'
      >
        <FaTimes className='h-4 w-4' />
      </button>
    </div>
  );
};

export default TaskCard;
