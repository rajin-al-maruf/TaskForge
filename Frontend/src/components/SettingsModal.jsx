import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../api/AuthContext.jsx';
import { FaUser, FaPalette, FaCreditCard } from 'react-icons/fa';
import AccountSettings from './settings/AccountSettings.jsx';
import AppearanceSettings from './settings/AppearanceSettings.jsx';
import BillingSettings from './settings/BillingSettings.jsx';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user } = useContext(AuthContext);
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isMounted || !user) return null;

  const tabs = [
    { id: 'account', label: 'Account', icon: FaUser },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'billing', label: 'Billing & Plan', icon: FaCreditCard },
  ];

  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
      onClick={onClose}
    >
      <div 
        className={`w-full max-w-4xl h-[620px] flex bg-brand-surface border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Settings Sidebar */}
        <div className="w-56 bg-neutral-950 border-r border-neutral-800 p-5 flex flex-col">
          <h2 className="text-lg font-bold text-white mb-5">Settings</h2>
          <div className="flex flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${activeTab === tab.id ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-400 hover:bg-neutral-900 hover:text-gray-200'}`}
                >
                  <Icon size={14} className={activeTab === tab.id ? 'text-brand-primary' : 'text-gray-500'} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 flex flex-col bg-brand-surface relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white bg-neutral-800/50 hover:bg-neutral-700/50 h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10">✕</button>
          
          <div className="p-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700">
            {activeTab === 'account' && <AccountSettings setActiveTab={setActiveTab} onClose={onClose} />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'billing' && <BillingSettings />}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SettingsModal;