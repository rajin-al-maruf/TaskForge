import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi.js';
import { getLists, createList as createListApi, deleteList as deleteListApi } from '../api/listApi.js';

export const priorityOrder = { high: 1, medium: 2, low: 3, none: 4 };

export const organizeTasks = (taskArray) => {
  const activeTasks = taskArray.filter((task) => task.status !== 'completed');
  const completedTasks = taskArray.filter((task) => task.status === 'completed');
  activeTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  return [...activeTasks, ...completedTasks];
};

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const [taskRes, listRes] = await Promise.all([
          getTasks(),
          getLists().catch(() => ({ success: false, lists: [] }))
        ]);
        
        if (taskRes.success) setTasks(organizeTasks(taskRes.tasks));
        else setFetchError(taskRes.message || 'Unable to load tasks');
        if (listRes.success) setCustomLists(listRes.lists);
      } catch (error) {
        setFetchError(error?.response?.data?.message || 'Could not fetch tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const saveTask = async (taskData, editingTask) => {
    try {
      if (editingTask) {
        const response = await updateTask(editingTask._id, taskData);
        if (response.success) {
          setTasks((prev) => organizeTasks(prev.map((task) => task._id === editingTask._id ? { ...task, ...response.updatedTask } : task)));
          toast.success(response.message || 'Task updated successfully');
          return { success: true };
        } else {
          toast.error(response.message || 'Unable to update task');
          return { success: false, message: response.message || 'Unable to update task' };
        }
      } else {
        const response = await createTask({ ...taskData, status: 'in-progress' });
        if (response.success) {
          setTasks((prev) => organizeTasks([response.task, ...prev]));
          toast.success(response.message || 'Task created successfully');
          return { success: true };
        } else {
          toast.error(response.message || 'Unable to create task');
          return { success: false, message: response.message || 'Unable to create task' };
        }
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || `Could not ${editingTask ? 'update' : 'create'} task`;
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    }
  };

  const removeTask = async (taskId) => {
    const taskToDelete = tasks.find(t => t._id === taskId);
    
    // Soft Delete: If the task is completed, we ARCHIVE it instead of permanently deleting it
    if (taskToDelete && taskToDelete.status === 'completed') {
      try {
        const response = await updateTask(taskId, { isArchived: true, archivedAt: new Date().toISOString() });
        if (response.success) {
          setTasks((prev) => prev.map((task) => task._id === taskId ? { ...task, isArchived: true } : task));
          toast.success('Task archived and kept for analysis');
        } else {
          toast.error(response.message || 'Unable to archive task');
        }
      } catch (error) {
        toast.error('Could not archive task');
      }
      return;
    }

    try {
      const response = await deleteTask(taskId);
      if (response.success) {
        setTasks((prev) => prev.filter((task) => task._id !== taskId));
        toast.success(response.message || 'Task deleted successfully');
      } else {
        setFetchError(response.message || 'Unable to delete task');
        toast.error(response.message || 'Unable to delete task');
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Could not delete task';
      setFetchError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const toggleTaskComplete = async (task) => {
    const nextStatus = task.status === 'completed' ? 'in-progress' : 'completed';
    const updatePayload = { status: nextStatus };
    if (nextStatus === 'completed') {
      updatePayload.completedAt = new Date().toISOString();
    }
    try {
      const response = await updateTask(task._id, updatePayload);
      if (response.success) {
        setTasks((prev) => organizeTasks(prev.map((item) => item._id === task._id ? { ...item, ...response.updatedTask } : item)));
        toast.success(`Task marked as ${nextStatus}`);
      } else {
        setFetchError(response.message || 'Unable to update task status');
        toast.error(response.message || 'Unable to update task status');
      }
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Unable to update task';
      setFetchError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return {
    tasks, customLists, setCustomLists, isLoading, fetchError, saveTask, removeTask, toggleTaskComplete
  };
};