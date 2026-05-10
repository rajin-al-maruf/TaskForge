import React, { useContext } from 'react';
import { FaMoon, FaSun, FaDesktop, FaCrown } from 'react-icons/fa';
import { AuthContext } from '../../api/AuthContext.jsx';
import { toast } from 'sonner';

const AppearanceSettings = () => {
  const { user, theme, setTheme, accentColor, setAccentColor } = useContext(AuthContext);
  const isProUser = user?.userType === 'pro';

  const themeOptions = [
    { id: 'light', label: 'Light Mode', icon: FaSun, desc: 'Clean and bright.' },
    { id: 'dark', label: 'Dark Mode', icon: FaMoon, desc: 'Easy on the eyes.' },
    { id: 'system', label: 'System', icon: FaDesktop, desc: 'Syncs with your OS.' }
  ];

  const accentOptions = [
    { id: 'blue', hex: '#38BDF8' },
    { id: 'rose', hex: '#FB7185' },
    { id: 'emerald', hex: '#4ADE80' },
    { id: 'violet', hex: '#C084FC' },
    { id: 'amber', hex: '#FBBF24' },
    { id: 'indigo', hex: '#818CF8' },
    { id: 'teal', hex: '#2DD4BF' },
    { id: 'fuchsia', hex: '#E879F9' }
  ];

  const handleColorSelect = (colorId) => {
    if (!isProUser && colorId !== 'blue') {
      toast.info('Custom accent colors are a PRO feature. Upgrade to unlock!', { icon: '✨' });
      return;
    }
    setAccentColor(colorId);
  };

  return (
    <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 pb-2">
      <h3 className="text-base font-semibold text-white mb-6">Appearance Settings</h3>
      
      <div className="space-y-4">
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Theme Preference</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
          {themeOptions.map(option => {
            const Icon = option.icon;
            const isActive = theme === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-sm' 
                    : 'bg-neutral-900 border-neutral-800 text-gray-400 hover:bg-neutral-800 hover:text-gray-200'
                }`}
              >
                <Icon size={24} className={isActive ? 'text-brand-primary' : 'text-gray-500'} />
                <div className="text-center">
                  <p className={`text-xs font-semibold ${isActive ? 'text-brand-primary' : 'text-white'}`}>{option.label}</p>
                  <p className="text-[10px] text-gray-500 mt-1">{option.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color Section */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <div className="flex items-center justify-between mb-4 max-w-xl">
          <div>
            <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Accent Color</h4>
            <p className="text-[10px] text-gray-500">Personalize your workspace with a custom color.</p>
          </div>
          {!isProUser && (
            <span className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[9px] font-bold uppercase tracking-wider rounded-md border border-yellow-500/20">
              <FaCrown size={10} /> Pro
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4">
          {accentOptions.map(color => (
            <button
              key={color.id}
              type="button"
              onClick={() => handleColorSelect(color.id)}
              style={{ backgroundColor: color.hex }}
              className={`h-8 w-8 rounded-full shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center border-2 outline-none ${
                accentColor === color.id 
                  ? 'border-white scale-110 ring-2 ring-white/20' 
                  : 'border-transparent hover:scale-110 opacity-70 hover:opacity-100'
              }`}
              aria-label={`Select ${color.id} theme`}
            >
              {/* Lock icon for non-pro users on locked colors */}
              {!isProUser && color.id !== 'blue' && accentColor !== color.id && (
                <FaCrown size={10} className="text-black/30 mix-blend-overlay" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;