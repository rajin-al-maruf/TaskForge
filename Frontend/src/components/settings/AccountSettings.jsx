import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../api/AuthContext.jsx';
import { FaUser, FaCrown } from 'react-icons/fa';
import { toast } from 'sonner';
import { updateProfile, deleteAccount, updatePassword } from '../../api/userApi.js';

const AccountSettings = ({ setActiveTab, onClose }) => {
  const { user, setUser, logout } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profilePicture: user.profilePicture || ''
      });
    }
  }, [user]);

  const isProUser = user?.userType === 'pro';

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB limit
        toast.error('Image must be less than 500KB to ensure fast loading.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.email.trim()) {
      toast.error('First name and email are required.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(formData);
      toast.success('Account details updated successfully!');
      if (setUser) {
        setUser(prev => {
          const updated = { ...prev, ...formData };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Update Profile Error:', error);
      toast.error(error.message || 'An error occurred while saving changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All fields are required.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Update Password Error:', error);
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      toast.success('Account deleted successfully. We will miss you!');
      onClose();
      logout(); // Automatically redirects back to auth screen
    } catch (error) {
      console.error('Delete Account Error:', error);
      toast.error(error.message || 'An error occurred while deleting your account.');
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 pb-2">
        <h3 className="text-base font-semibold text-white mb-4">Account Details</h3>
        
        {/* Avatar & Name Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative h-14 w-14 rounded-full bg-brand-primary flex items-center justify-center text-white text-2xl font-bold shadow-xl overflow-hidden group cursor-pointer border-2 border-brand-surface shrink-0">
            {formData.profilePicture ? (
              <img src={formData.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.firstName?.charAt(0) || 'U'
            )}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white">Edit</span>
            </div>
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/*" 
              onChange={handleImageUpload} 
              onClick={(e) => (e.target.value = null)}
            />
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <h4 className="text-lg font-bold text-white leading-tight truncate">{user?.firstName} {user?.lastName}</h4>
            <p className="text-xs text-gray-400 mt-0.5 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Subscription Status Card */}
        <div className={`w-full flex items-center justify-between p-3 rounded-xl border mb-5 ${isProUser ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-inner ${isProUser ? 'bg-yellow-500/20 text-yellow-500' : 'bg-brand-bg border border-white/5 text-gray-400'}`}>
              {isProUser ? <FaCrown size={14} /> : <FaUser size={14} />}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-white">{isProUser ? 'Pro Plan' : 'Free Plan'}</span>
              <span className="text-[10px] text-gray-500">{isProUser ? 'All features unlocked' : 'Basic features'}</span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                First Name
              </label>
              <input 
                type="text" 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-white text-xs focus:outline-none focus:border-brand-primary transition-colors" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Last Name
              </label>
              <input 
                type="text" 
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})} 
                className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-white text-xs focus:outline-none focus:border-brand-primary transition-colors" 
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Email Address
            </label>
            <input 
              type="email" 
              required 
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$" 
              title="Please enter a valid email address (e.g. user@domain.com)" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-white text-xs focus:outline-none focus:border-brand-primary transition-colors" 
            />
          </div>
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSaving} 
              className="px-5 py-2 bg-brand-primary text-white text-xs font-semibold rounded-md hover:bg-brand-primary/90 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Password Section */}
        <div className="mt-8 pt-5 border-t border-white/5 flex flex-col items-start gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Password</h4>
            <p className="text-[10px] text-gray-500 leading-tight">Ensure your account is using a long, random password to stay secure.</p>
          </div>
          
          {!showPasswordForm ? (
            <button 
              type="button" 
              onClick={() => setShowPasswordForm(true)} 
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-white text-xs font-medium rounded-md transition-colors cursor-pointer border border-white/5"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handlePasswordSave} className="w-full max-w-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Current Password</label>
                <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-white text-xs focus:outline-none focus:border-brand-primary transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">New Password</label>
                  <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-white text-xs focus:outline-none focus:border-brand-primary transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Confirm Password</label>
                  <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-md text-white text-xs focus:outline-none focus:border-brand-primary transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button type="submit" disabled={isUpdatingPassword} className="px-5 py-2 bg-brand-primary text-white text-xs font-semibold rounded-md hover:bg-brand-primary/90 transition-colors cursor-pointer shadow-sm disabled:opacity-50">
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordData({currentPassword: '', newPassword: '', confirmPassword: ''}); }} className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md text-xs font-medium transition-colors cursor-pointer border border-transparent">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-5 border-t border-red-500/20 flex flex-col items-start gap-3">
          <div>
            <h4 className="text-xs font-semibold text-red-400 mb-1">Danger Zone</h4>
            <p className="text-[10px] text-gray-500 leading-tight">Permanently delete your account and all of your content. This action is not reversible.</p>
          </div>
          <button type="button" onClick={() => setShowDeleteModal(true)} className="shrink-0 px-4 py-2 bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider rounded-md hover:bg-red-500/20 transition-colors cursor-pointer border border-red-500/20">
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => !isDeleting && setShowDeleteModal(false)}>
          <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete Account?</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              We're sorry to see you go! This action is permanent and cannot be undone. All your tasks, lists, and data will be wiped out.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountSettings;