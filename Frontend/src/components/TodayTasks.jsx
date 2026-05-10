import React, { useMemo, useState, useContext } from 'react'
import { FaLightbulb } from 'react-icons/fa'
import { toast } from 'sonner'
import MyTasks from './MyTasks.jsx'
import FocusView from './FocusView.jsx'
import { AuthContext } from '../api/AuthContext.jsx'

const padDate = (value) => String(value).padStart(2, '0')
const toLocalISODate = (date) => `${date.getFullYear()}-${padDate(date.getMonth() + 1)}-${padDate(date.getDate())}`

const TodayTasks = ({
  tasks,
  isLoading,
  error,
  onOpenModal,
  onEditTask,
  onToggleComplete,
  onDeleteTask,
  onUpdateTask,
  filters,
  setFilters,
  allLists,
  sortBy,
  setSortBy
}) => {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const { user } = useContext(AuthContext);

  const todayTasks = useMemo(
    () => {
      const todayKey = toLocalISODate(new Date());
      return tasks.filter((task) => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate);
        return toLocalISODate(taskDate) === todayKey;
      });
    },
    [tasks]
  )

  const isProUser = user?.userType === 'pro';

  const handleToggleFocusMode = () => {
    if (!isProUser) {
      toast.info('Focus Mode is a TaskForge Pro feature. Upgrade to unlock!', { icon: '✨' });
      return;
    }
    setIsFocusMode(!isFocusMode);
  };

  return (
    <div className="w-full max-w-4xl mx-auto pt-16">
      {/* Focus Mode Toggle */}
      <div className="fixed right-8 top-8 z-30 flex items-center gap-3 bg-neutral-900/80 border border-neutral-800 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
        <FaLightbulb className={isFocusMode ? "text-yellow-400" : "text-gray-500"} size={14} />
        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Focus Mode {!isProUser && <span className="ml-1 text-yellow-500 font-black">PRO</span>}
        </span>
        <button 
          onClick={handleToggleFocusMode}
          className={`w-10 h-5 rounded-full transition-colors relative flex items-center cursor-pointer ${isFocusMode ? 'bg-brand-primary' : 'bg-neutral-700'}`}
        >
          <span className={`w-4 h-4 bg-white rounded-full absolute transition-all shadow-sm ${isFocusMode ? 'left-[22px]' : 'left-1'}`} />
        </button>
      </div>

      {isFocusMode ? (
        <FocusView 
           tasks={todayTasks} 
           onToggleComplete={onToggleComplete} 
           onEditTask={onEditTask}
           onUpdateTask={onUpdateTask}
        />
      ) : (
        <div className="-mt-16">
          <MyTasks
            title='Today'
            tasks={todayTasks}
            isLoading={isLoading}
            error={error}
            onOpenModal={onOpenModal}
            onEditTask={onEditTask}
            onToggleComplete={onToggleComplete}
            onDeleteTask={onDeleteTask}
            filters={filters}
            setFilters={setFilters}
            allLists={allLists}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>
      )}
    </div>
  )
}

export default TodayTasks
