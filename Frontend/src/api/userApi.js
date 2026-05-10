const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export const updateProfile = async (formData) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(formData)
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update account details');
  return data;
};

export const deleteAccount = async () => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete account');
  return data;
};

export const updatePassword = async (passwordData) => {
  const response = await fetch(`${API_URL}/users/password`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(passwordData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update password');
  return data;
};