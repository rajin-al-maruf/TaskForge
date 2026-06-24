import axiosInstance from './axiosInstance';

const BASE_URL = '/lists';

export const getLists = async () => {
  const response = await axiosInstance.get(BASE_URL);
  return response.data;
};

export const createList = async (data) => {
  const response = await axiosInstance.post(BASE_URL, data);
  return response.data;
};

export const deleteList = async (id) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${id}`);
  return response.data;
};