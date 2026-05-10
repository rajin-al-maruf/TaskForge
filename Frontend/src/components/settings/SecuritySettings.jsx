import React, { useState } from 'react';
import { toast } from 'sonner';
import { updatePassword } from '../../api/userApi.js';

const SecuritySettings = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('All fields are required.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setIsSaving(true);
    try {
      await updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success('Password updated successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Update Password Error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 pb-2">
      <h3 className="text-base font-semibold text-white mb-4">Security Settings</h3>
      
      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Current Password</label>
          <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-white text-xs focus:outline-none focus:border-brand-primary transition-colors" />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">New Password</label>
          <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-white text-xs focus:outline-none focus:border-brand-primary transition-colors" />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-white text-xs focus:outline-none focus:border-brand-primary transition-colors" />
        </div>
        
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isSaving} 
            className="px-5 py-2 bg-brand-primary text-white text-xs font-semibold rounded-md hover:bg-brand-primary/90 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecuritySettings;