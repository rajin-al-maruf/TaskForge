import React, { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import Sidebar from '../components/Sidebar.jsx'
import MyTasks from '../components/MyTasks.jsx'
import TodayTasks from '../components/TodayTasks.jsx'
import Calendar from '../components/Calendar.jsx'
import ListTasks from '../components/ListTasks.jsx'
import TaskModal from '../components/TaskModal.jsx'
import { createTask, deleteTask, getTasks, updateTask } from '../api/taskApi.js'
import { getLists, createList, deleteList } from '../api/listApi.js'

const priorityOrder = { high: 1, medium: 2, low: 3 }

const organizeTasks = (taskArray) => {
  const activeTasks = taskArray.filter((task) => task.status !== 'completed')
  const completedTasks = taskArray.filter((task) => task.status === 'completed')
  activeTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  return [...activeTasks, ...completedTasks]
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('today')
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [taskError, setTaskError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [customLists, setCustomLists] = useState([])
  const [defaultDate, setDefaultDate] = useState('')

  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true)
      setFetchError('')

      try {
        const [taskRes, listRes] = await Promise.all([
          getTasks(),
          getLists().catch(() => ({ success: false, lists: [] }))
        ])
        
        if (taskRes.success) setTasks(organizeTasks(taskRes.tasks))
        else setFetchError(taskRes.message || 'Unable to load tasks')
        if (listRes.success) setCustomLists(listRes.lists)
      } catch (error) {
        setFetchError(error?.response?.data?.message || 'Could not fetch tasks')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

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

    try {
      if (editingTask) {
        const response = await updateTask(editingTask._id, taskData)
        if (response.success) {
          setTasks((prev) => organizeTasks(
            prev.map((task) =>
              task._id === editingTask._id
                ? { ...task, ...response.updatedTask }
                : task
            )
          ))
          toast.success(response.message || 'Task updated successfully')
          handleCloseModal()
        } else {
          setTaskError(response.message || 'Unable to update task')
          toast.error(response.message || 'Unable to update task')
        }
      } else {
        const response = await createTask({
          ...taskData,
          status: 'in-progress'
        })
        if (response.success) {
          setTasks((prev) => organizeTasks([response.task, ...prev]))
          toast.success(response.message || 'Task created successfully')
          handleCloseModal()
        } else {
          setTaskError(response.message || 'Unable to create task')
          toast.error(response.message || 'Unable to create task')
        }
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || `Could not ${editingTask ? 'update' : 'create'} task`
      setTaskError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await deleteTask(taskId)
      if (response.success) {
        setTasks((prev) => prev.filter((task) => task._id !== taskId))
        toast.success(response.message || 'Task deleted successfully')
      } else {
        setFetchError(response.message || 'Unable to delete task')
        toast.error(response.message || 'Unable to delete task')
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Could not delete task'
      setFetchError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const toggleTaskComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'in-progress' : 'completed'

    try {
      const response = await updateTask(task._id, { status: nextStatus })
      if (response.success) {
        setTasks((prev) => organizeTasks(
          prev.map((item) =>
            item._id === task._id ? { ...item, status: nextStatus } : item
          )
        ))
        toast.success(`Task marked as ${nextStatus}`)
      } else {
        setFetchError(response.message || 'Unable to update task status')
        toast.error(response.message || 'Unable to update task status')
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Unable to update task'
      setFetchError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const handleCreateList = async (listName) => {
    try {
      const response = await createList({ name: listName })
      if (response.success) {
        setCustomLists((prev) => [...prev, response.list])
        setActiveTab(listName) // Auto-switch to the newly created list
        toast.success('List created successfully')
      } else {
        toast.error(response.message || 'Failed to create list')
      }
    } catch (error) {
      console.error('Failed to create list:', error)
      toast.error(error?.response?.data?.message || 'Failed to create list')
    }
  }

  const handleDeleteList = async (listId, listName) => {
    try {
      const response = await deleteList(listId);
      if (response.success) {
        setCustomLists((prev) => prev.filter((list) => list._id !== listId));
        if (activeTab === listName) {
          setActiveTab('tasks'); // Go back to My Tasks if viewing the deleted list
        }
        toast.success('List deleted successfully')
      } else {
        toast.error(response.message || 'Failed to delete list')
      }
    } catch (error) {
      console.error('Failed to delete list:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete list')
    }
  };

  const sortedTasks = useMemo(() => organizeTasks(tasks), [tasks])

  const getLocalDateKey = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  }

  return (
    <div className='bg-brand-bg min-h-screen flex'>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        customLists={customLists}
        onCreateList={handleCreateList}
        onDeleteList={handleDeleteList}
      />
      <div className='flex-1 p-4'>
        {activeTab === 'tasks' && (
          <MyTasks
            title='My Tasks'
            tasks={sortedTasks}
            isLoading={isLoading}
            error={fetchError}
            onOpenModal={handleOpenModal}
            onEditTask={handleOpenModal}
            onToggleComplete={toggleTaskComplete}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab !== 'tasks' && activeTab !== 'today' && activeTab !== 'calendar' && (
          <ListTasks
            listName={activeTab}
            tasks={sortedTasks.filter(t => t.list === activeTab)}
            isLoading={isLoading}
            error={fetchError}
            onOpenModal={handleOpenModal}
            onEditTask={handleOpenModal}
            onToggleComplete={toggleTaskComplete}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'today' && (
          <TodayTasks
            tasks={sortedTasks}
            isLoading={isLoading}
            error={fetchError}
            onOpenModal={handleOpenModal}
            onEditTask={handleOpenModal}
            onToggleComplete={toggleTaskComplete}
            onDeleteTask={handleDeleteTask}
          />
        )}

        {activeTab === 'calendar' && (
          <Calendar
            tasks={sortedTasks}
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