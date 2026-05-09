import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStop, FaCheck, FaRegCircle, FaRegCheckCircle } from 'react-icons/fa';
import { toast } from 'sonner';
import EmptyTaskState from './EmptyTaskState.jsx';

const FocusView = ({ tasks, onToggleComplete, onEditTask, onUpdateTask }) => {
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  const activeTask = activeTasks.find(t => t._id === activeTaskId) || activeTasks[0];

  useEffect(() => {
    if (activeTask && !isRunning && timeLeft === 0) {
      setTimeLeft((activeTask.timeEstimate || 25) * 60);
    }
  }, [activeTask]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            toast.success('Time is up! Great focus session.');
            
            // Play a standard alarm beep
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg');
            audio.play().catch(() => {});
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handlePlayPause = () => {
    if (!activeTask) return;
    if (!activeTaskId) {
        setActiveTaskId(activeTask._id);
        setTimeLeft((activeTask.timeEstimate || 25) * 60);
    }
    setIsRunning(!isRunning);
  };

  const handleStop = () => {
    setIsRunning(false);
    if (activeTask) setTimeLeft((activeTask.timeEstimate || 25) * 60);
  };

  const switchTask = (task) => {
    if (isRunning && !window.confirm('A timer is running. Switch tasks anyway?')) return;
    setIsRunning(false);
    setActiveTaskId(task._id);
    setTimeLeft((task.timeEstimate || 25) * 60);
  };

  const handleSubtaskToggle = (e, task, index) => {
    e.stopPropagation();
    const newSubtasks = [...task.subtasks];
    newSubtasks[index].completed = !newSubtasks[index].completed;
    if (onUpdateTask) onUpdateTask(task, { subtasks: newSubtasks });
  };

  if (activeTasks.length === 0) {
    return <div className="mt-8"><EmptyTaskState title="All done!" description="No tasks left for today. Enjoy your free time!" /></div>;
  }

  const totalSeconds = (activeTask.timeEstimate || 25) * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 283;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 mt-8 transition-all duration-300">
       <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden min-h-100">
          <div className="absolute inset-0 bg-brand-primary/5 blur-[100px] pointer-events-none" />
          <h2 className="text-2xl font-semibold text-white mb-2 text-center z-10">{activeTask.title}</h2>
          
          <p className="text-sm text-gray-400 mb-8 z-10 cursor-pointer hover:text-brand-primary transition-colors" onClick={() => onEditTask(activeTask)}>
            {activeTask.subtasks?.length || 0} sub-tasks • Click to view
          </p>

          <div className="relative w-56 h-56 mb-10 z-10">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#262626" strokeWidth="4" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="283" strokeDashoffset={progress || 0} className="text-brand-primary transition-all duration-1000 ease-linear" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-5xl font-bold text-white tabular-nums tracking-tight drop-shadow-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <div className="flex items-center gap-6 z-10">
             <button onClick={handleStop} className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 text-gray-400 transition-colors shadow-md cursor-pointer"><FaStop /></button>
             <button onClick={handlePlayPause} className="w-16 h-16 flex items-center justify-center rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white text-xl shadow-lg transition-transform active:scale-95 cursor-pointer">{isRunning ? <FaPause /> : <FaPlay className="ml-1" />}</button>
             <button onClick={() => { handleStop(); onToggleComplete(activeTask); }} className="w-12 h-12 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-green-500/20 text-gray-400 hover:text-green-400 transition-colors shadow-md cursor-pointer" title="Mark Complete"><FaCheck /></button>
          </div>
       </div>
       <div className="w-full lg:w-80 flex flex-col gap-4">
         <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1 px-1">Up Next</h3>
         <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-120">
           {activeTasks.map(task => (
             <div key={task._id} onClick={() => switchTask(task)} className={`p-5 rounded-2xl border cursor-pointer transition-all ${activeTask._id === task._id ? 'bg-brand-primary/10 border-brand-primary/50 shadow-lg' : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'}`}>
               <div className="flex items-start justify-between gap-3"><p className={`text-sm font-semibold ${activeTask._id === task._id ? 'text-brand-primary' : 'text-gray-200'}`}>{task.title}</p><span className="text-[10px] font-bold text-gray-400 bg-neutral-800 px-2 py-1 rounded-md">{task.timeEstimate || 25}m</span></div>
             {task.subtasks && task.subtasks.length > 0 && (<div className="mt-4 space-y-2">{task.subtasks.map((st, i) => (<div key={i} onClick={(e) => handleSubtaskToggle(e, task, i)} className="flex items-center gap-2.5 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer">{st.completed ? <FaRegCheckCircle className="text-brand-primary text-[11px] flex-shrink-0" /> : <FaRegCircle className="text-[11px] flex-shrink-0" />}<span className={`truncate ${st.completed ? 'line-through opacity-50' : ''}`}>{st.title}</span></div>))}</div>)}
             </div>
           ))}
         </div>
       </div>
    </div>
  );
}
export default FocusView;