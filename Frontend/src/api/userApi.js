import axiosInstance from './axiosInstance';

export const updateProfile = async (formData) => {
  const response = await axiosInstance.put('/users/profile', formData);
  return response.data;
};

export const deleteAccount = async () => {
  const response = await axiosInstance.delete('/users/profile');
  return response.data;
};

export const updatePassword = async (passwordData) => {
  const response = await axiosInstance.put('/users/password', passwordData);
  return response.data;
};