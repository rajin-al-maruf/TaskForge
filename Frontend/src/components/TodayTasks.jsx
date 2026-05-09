import React, { useMemo } from 'react'
import MyTasks from './MyTasks.jsx'

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
}) => {
  const todayKey = useMemo(() => toLocalISODate(new Date()), [])

  const todayTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (!task.dueDate) return false
        return task.dueDate.slice(0, 10) === todayKey
      }),
    [tasks, todayKey]
  )

  return (
    <MyTasks
      title='Today'
      tasks={todayTasks}
      isLoading={isLoading}
      error={error}
      onOpenModal={onOpenModal}
      onEditTask={onEditTask}
      onToggleComplete={onToggleComplete}
      onDeleteTask={onDeleteTask}
    />
  )
}

export default TodayTasks
