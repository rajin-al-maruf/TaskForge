const BASE_URL = 'http://localhost:5000/api/lists';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getLists = async () => {
  const response = await fetch(BASE_URL, { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch lists');
  return response.json();
};

export const createList = async (data) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create list');
  return response.json();
};

export const deleteList = async (id) => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete list');
  return response.json();
};