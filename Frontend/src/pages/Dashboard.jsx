import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Sidebar from '../components/Sidebar.jsx'
import MyTasks from '../components/MyTasks.jsx'
import TodayTasks from '../components/TodayTasks.jsx'
import Calendar from '../components/Calendar.jsx'
import ListTasks from '../components/ListTasks.jsx'
import TaskModal from '../components/TaskModal.jsx'
import PerformanceAnalysis from '../components/PerformanceAnalysis.jsx'
import { useTasks, priorityOrder } from '../hooks/useTasks.js'
import LoadingSpinner from '../components/LoadingSpinner.jsx'

const Dashboard = () => {
  const { tasks, customLists, isLoading, fetchError, saveTask, removeTask, toggleTaskComplete, createNewList, deleteExistingList } = useTasks();
  
  const [activeTab, setActiveTab] = useState('today')
  const [taskError, setTaskError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [defaultDate, setDefaultDate] = useState('')
  const [filters, setFilters] = useState({ priority: 'all', status: 'all', list: 'all' })
  const [sortBy, setSortBy] = useState('priority')

  const allLists = useMemo(() => {
    return [
      { name: 'Personal' },
      { name: 'Work' },
      { name: 'Study' },
      ...customLists.filter(l => l.name !== 'Personal' && l.name !== 'Work' && l.name !== 'Study')
    ];
  }, [customLists]);

  const handleOpenModal = (task = null, date = '') => {
    setTaskError('')
    setEditingTask(task)
    setDefaultDate(date)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTask(null)
    setTaskError('')
    setDefaultDate('')
  }

  const handleSaveTask = async (taskData) => {
    setTaskError('')
    const result = await saveTask(taskData, editingTask);
    if (result.success) handleCloseModal();
    else setTaskError(result.message);
  }

  const handleDeleteTask = async (taskId) => {
    await removeTask(taskId);
  }

  const handleCreateList = async (listName) => {
    const result = await createNewList(listName);
    if (result.success) {
      setActiveTab(listName); // Auto-switch to the newly created list
    }
  }

  const handleDeleteList = async (listId, listName) => {
    // Optional: Ask for confirmation before deleting
    const result = await deleteExistingList(listId);
    if (result.success) {
      if (activeTab === listName) {
        setActiveTab('tasks'); // Go back to My Tasks if viewing the deleted list
      }
    }
  };

  const commonTaskProps = {
    isLoading,
    error: fetchError,
    onOpenModal: handleOpenModal,
    onEditTask: handleOpenModal,
    onToggleComplete: toggleTaskComplete,
    onDeleteTask: handleDeleteTask,
    onUpdateTask: (task, updates) => saveTask({ ...task, ...updates }, task),
    filters,
    setFilters,
    sortBy,
    setSortBy,
  };

  const displayTasks = useMemo(() => {
    let result = tasks.filter(task => {
      if (task.isArchived) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (activeTab === 'tasks' || activeTab === 'today' || activeTab === 'calendar') {
        if (filters.list !== 'all' && task.list !== filters.list) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      if (sortBy === 'priority') {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === 'due') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'recent') {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      }
      return 0;
    });
    
    return result;
  }, [tasks, filters, activeTab, sortBy]);

  const getLocalDateKey = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading workspace..." fullScreen={true} />
  }

  return (
    <div className='bg-brand-bg h-screen flex overflow-hidden'>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        customLists={customLists}
        onCreateList={handleCreateList}
        onDeleteList={handleDeleteList}
      />
      <div className='flex-1 p-4 overflow-y-auto'>
        {activeTab === 'tasks' && (
          <MyTasks
            title='My Tasks'
            tasks={displayTasks}
            allLists={allLists}
            {...commonTaskProps}
          />
        )}

        {activeTab === 'performance' && <PerformanceAnalysis tasks={tasks} />}

        {activeTab !== 'tasks' && activeTab !== 'today' && activeTab !== 'calendar' && activeTab !== 'performance' && (
          <ListTasks
            listName={activeTab}
            tasks={displayTasks.filter(t => t.list === activeTab)}
            {...commonTaskProps}
          />
        )}

        {activeTab === 'today' && (
          <TodayTasks
            tasks={displayTasks}
            allLists={allLists}
            {...commonTaskProps}
          />
        )}

        {activeTab === 'calendar' && (
          <Calendar
            tasks={displayTasks}
            onOpenModal={handleOpenModal}
            onEditTask={handleOpenModal}
          />
        )}
      </div>

      {showModal && (
        <TaskModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveTask}
          editingTask={editingTask}
          error={taskError}
          defaultDate={defaultDate || (activeTab !== 'tasks' && activeTab !== 'calendar' && !editingTask ? getLocalDateKey() : '')}
          customLists={customLists}
          activeTab={activeTab}
        />
      )}
    </div>
  )
}

export default Dashboard