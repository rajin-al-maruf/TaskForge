import React, { useState, useContext, useRef, useEffect } from 'react';
import { FaVolumeUp, FaCalendarAlt, FaClock, FaCheckSquare, FaCrown, FaChevronDown } from 'react-icons/fa';
import { AuthContext } from '../../api/AuthContext.jsx';
import { toast } from 'sonner';
import { updateProfile } from '../../api/userApi.js';

const weekOptions = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' }
];

const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between min-w-[140px] bg-neutral-950 border border-neutral-800 text-white text-xs font-medium rounded-lg px-3 py-2 outline-none hover:border-neutral-700 focus:border-brand-primary transition-colors cursor-pointer shadow-sm">
        <span className="truncate mr-3">{selectedOption.label}</span>
        <FaChevronDown size={10} className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`absolute right-0 top-full mt-1.5 w-max min-w-[140px] bg-neutral-950/95 backdrop-blur-xl border border-neutral-800/80 rounded-xl shadow-2xl py-1.5 z-[60] transition-all duration-200 origin-top-right ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col">
          {options.map((option) => (
            <button key={option.value} type="button" onClick={() => { onChange(option.value); setIsOpen(false); }} className={`w-full px-3 py-2.5 text-xs text-left transition-colors cursor-pointer ${value === option.value ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-gray-400 hover:bg-neutral-800 hover:text-white'}`}>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PreferencesSettings = () => {
  const { user, setUser } = useContext(AuthContext);
  const isProUser = user?.userType === 'pro';

  const defaultPrefs = {
    startOfWeek: 'sunday',
    timeFormat: '12h',
    soundEnabled: true,
  };

  const [formData, setFormData] = useState(user?.preferences || defaultPrefs);

  const [initialData, setInitialData] = useState({ ...formData });
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleProToggle = (field, value, featureName) => {
    if (!isProUser) {
      toast.info(`${featureName} is a PRO feature. Upgrade to unlock!`, { icon: '✨' });
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ preferences: formData });
      setInitialData(formData);
      if (setUser) {
        setUser((prev) => {
          const updated = { ...prev, preferences: formData };
          localStorage.setItem('user', JSON.stringify(updated));
          return updated;
        });
      }
      toast.success("Preferences updated successfully!");
    } catch (error) {
      console.error('Update Preferences Error:', error);
      toast.error(error.message || 'An error occurred while saving changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const ToggleSwitch = ({ enabled, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${enabled ? 'bg-brand-primary' : 'bg-neutral-700'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 pb-2">
      <h3 className="text-base font-semibold text-white mb-6">Preferences</h3>
      
      <div className="space-y-6">
        {/* Date & Time Options */}
        <div>
          <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Date & Time</h4>
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400">
                  <FaCalendarAlt size={12} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Start of Week</p>
                  <p className="text-[10px] text-gray-500">Choose your preferred first day.</p>
                </div>
              </div>
              <CustomSelect 
            value={formData.startOfWeek}
            onChange={(val) => setFormData((prev) => ({ ...prev, startOfWeek: val }))}
                options={weekOptions}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400">
                  <FaClock size={12} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Time Format</p>
                  <p className="text-[10px] text-gray-500">12-hour (AM/PM) or 24-hour.</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
              <button onClick={() => setFormData((prev) => ({ ...prev, timeFormat: '12h' }))} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${formData.timeFormat === '12h' ? 'bg-neutral-800 text-white' : 'text-gray-500 hover:text-white'}`}>12h</button>
              <button onClick={() => setFormData((prev) => ({ ...prev, timeFormat: '24h' }))} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${formData.timeFormat === '24h' ? 'bg-neutral-800 text-white' : 'text-gray-500 hover:text-white'}`}>24h</button>
              </div>
            </div>
          </div>
        </div>

        {/* Application Behavior */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Application Behavior</h4>
            {!isProUser && <span className="flex items-center gap-1 px-1.5 py-0.5 bg-yellow-500/10 text-yellow-500 text-[8px] font-bold uppercase tracking-wider rounded border border-yellow-500/20"><FaCrown size={8} /> Pro</span>}
          </div>
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800 opacity-100 transition-opacity">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400">
                  <FaVolumeUp size={12} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white flex items-center gap-2">Completion Sounds</p>
                  <p className="text-[10px] text-gray-500">Play a satisfying sound when checking off a task.</p>
                </div>
              </div>
            <ToggleSwitch enabled={formData.soundEnabled} onClick={() => handleProToggle('soundEnabled', !formData.soundEnabled, 'Completion Sounds')} />
            </div>
          </div>
        </div>
      </div>

    {hasChanges && (
      <div className="pt-6 mt-8 border-t border-neutral-800/60 flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2 bg-brand-primary text-white text-xs font-semibold rounded-md hover:bg-brand-primary/90 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
        >
          {isSaving ? 'Updating...' : 'Update Preferences'}
        </button>
      </div>
    )}
    </div>
  );
};

export default PreferencesSettings;