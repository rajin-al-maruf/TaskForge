import axiosInstance from './axiosInstance';

const getTasks = async () => {
  const res = await axiosInstance.get('/tasks/today');
  return res.data;
};

const createTask = async (taskData) => {
  const res = await axiosInstance.post('/tasks/today', taskData);
  return res.data;
};

const updateTask = async (taskId, updateData) => {
  const res = await axiosInstance.put(`/tasks/today/${taskId}`, updateData);
  return res.data;
};

const deleteTask = async (taskId) => {
  const res = await axiosInstance.delete(`/tasks/today/${taskId}`);
  return res.data;
};

export { getTasks, createTask, updateTask, deleteTask };