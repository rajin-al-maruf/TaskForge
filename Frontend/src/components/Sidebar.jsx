import { useState, useContext, useRef, useEffect } from 'react';
import { PiSidebarSimpleLight } from "react-icons/pi";
import { RiTaskLine } from "react-icons/ri";
import { FaRegCalendarAlt, FaChartLine, FaCog, FaUser, FaSignOutAlt, FaChevronDown, FaCrown } from "react-icons/fa";
import { GrTarget } from "react-icons/gr";
import { toast } from 'sonner';
import CreateListModal from './CreateListModal.jsx';
import { AuthContext } from '../api/AuthContext.jsx';
import SettingsModal from './SettingsModal.jsx';
import ProPlanModal from './ProPlanModal.jsx';


const Sidebar = ({activeTab, setActiveTab, customLists = [], onCreateList, onDeleteList}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('account');
  const dropdownRef = useRef(null);
  
  const { user, logout } = useContext(AuthContext);
  const isProUser = user?.userType === 'pro';
  const FREE_LIST_LIMIT = 3; // Free users can create up to 3 custom lists

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const handleToggle = () => {
    setCollapsed((prev) => !prev);
  };

  const handleProFeatureClick = (featureName, tabId) => {
    if (!isProUser) {
      toast.info(`${featureName} is a PRO feature. Upgrade to unlock!`, { icon: '✨' });
    } else {
      if (tabId) {
        setActiveTab(tabId);
        setIsMobileOpen(false);
      } else toast.success(`Opening ${featureName}...`);
    }
    setIsDropdownOpen(false);
  };

  const tabItems = [
    { id: 'tasks', icon: RiTaskLine, label: 'My Tasks' },
    { id: 'today', icon: GrTarget, label: 'Today' },
    { id: 'calendar', icon: FaRegCalendarAlt, label: 'Calendar' }
  ];

  return (
    <>
      {/* Mobile Menu Toggle (FAB) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 p-3.5 bg-brand-primary text-white rounded-full shadow-lg shadow-brand-primary/30 hover:bg-brand-primary/90 transition-transform active:scale-95 cursor-pointer"
        aria-label="Open menu"
      >
        <PiSidebarSimpleLight size={24} />
      </button>

      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 lg:sticky lg:top-0 h-screen bg-brand-surface p-4 text-gray-500 overflow-y-auto transition-all duration-300 flex flex-col ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 lg:shadow-none'} ${collapsed ? 'lg:w-16 w-72' : 'w-72'}`}>
        {/* Header: Profile & Collapse */}
        <div className={`flex mb-8 items-center ${collapsed ? 'max-lg:justify-between lg:flex-col lg:gap-4 lg:justify-center' : 'justify-between'}`}>
          {/* Profile Section & Dropdown */}
          <div className={`relative ${collapsed ? 'lg:flex lg:justify-center' : ''}`} ref={dropdownRef}>
            <div 
              className={`flex items-center gap-2 p-1.5 rounded-md bg-brand-surface border border-neutral-800 shadow-sm hover:bg-neutral-800 cursor-pointer transition-all ${collapsed ? 'lg:justify-center max-lg:pr-3' : 'pr-3'}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold shadow-inner shrink-0 overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.firstName?.charAt(0) || 'U'
                )}
              </div>
              
              <div className={`flex flex-col overflow-hidden max-w-[110px] ${collapsed ? 'lg:hidden' : ''}`}>
                    <span className="text-gray-200 text-xs font-semibold truncate leading-tight">
                      {user?.firstName}
                    </span>
                    <span className="text-brand-primary/80 text-[9px] font-bold uppercase tracking-wider mt-0.5 leading-none">
                      {isProUser ? 'Pro Plan' : 'Free Plan'}
                    </span>
                  </div>
                  <FaChevronDown 
                className={`text-gray-500 transition-transform duration-200 shrink-0 ml-1 ${isDropdownOpen ? 'rotate-180' : ''} ${collapsed ? 'lg:hidden' : ''}`} 
                    size={10} 
                  />
            </div>

            {/* Popdown Menu */}
            <div className={`absolute mt-2 w-64 ${collapsed ? 'lg:top-0 lg:left-full lg:ml-2 top-full left-0' : 'top-full left-0'} bg-brand-surface border border-neutral-700 rounded-xl shadow-2xl py-2 z-50 transition-all duration-200 origin-top-left ${isDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <button onClick={() => handleProFeatureClick('Performance Analysis', 'performance')} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer">
              <div className="flex items-center gap-3"><FaChartLine size={14} className="text-gray-400" /> Performance Analysis</div>
              {!isProUser && <span className="text-[9px] font-bold bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded uppercase tracking-wider">PRO</span>}
            </button>
            <button onClick={() => { setIsDropdownOpen(false); setSettingsTab('account'); setIsSettingsModalOpen(true); setIsMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer">
              <FaCog size={14} className="text-gray-400" /> Settings
            </button>
            <button onClick={() => { setIsDropdownOpen(false); setIsProModalOpen(true); setIsMobileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer">
              <FaCrown size={14} className="text-yellow-500" /> Pro Plan
            </button>
            
            <div className="h-px bg-neutral-800 my-1"></div>
            
            <button 
              onClick={() => { logout(); setIsMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-neutral-800 hover:text-red-300 transition-colors cursor-pointer"
            >
              <FaSignOutAlt size={14} /> Logout
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className='hidden lg:block cursor-pointer text-gray-400 hover:text-brand-primary hover:bg-neutral-800 p-1.5 rounded-lg transition-colors shrink-0'
            aria-label={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
          >
            <PiSidebarSimpleLight size={20} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className='lg:hidden cursor-pointer text-gray-400 hover:text-brand-primary hover:bg-neutral-800 p-1.5 rounded-lg transition-colors shrink-0'
            aria-label='Close sidebar'
          >
            ✕
          </button>
        </div>
        </div>

        <div className='flex flex-col gap-2'>
          {tabItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex items-center gap-2 w-full p-2 cursor-pointer rounded text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-primary/20 text-brand-primary font-semibold'
                    : 'hover:bg-neutral-800 text-gray-500'
                } ${collapsed ? 'lg:justify-center' : ''}`}
              >
                <Icon size={20}/>
                <p className={`${collapsed ? 'lg:hidden block' : 'block'}`}>{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Custom Lists Section */}
        <div className={`mt-8 flex flex-col gap-2 ${collapsed ? 'lg:items-center' : ''}`}>
          <div className={`flex items-center justify-between mb-2 px-2 ${collapsed ? 'lg:hidden' : ''}`}>
              <p className='text-xs font-bold uppercase tracking-wider text-gray-600'>My Lists</p>
              <button 
                onClick={() => {
                  if (!isProUser && customLists.length >= FREE_LIST_LIMIT) {
                    toast.info(`Free plan is limited to ${FREE_LIST_LIMIT} custom lists. Upgrade to Pro for unlimited lists!`, { icon: '✨' });
                    return;
                  }
                  setIsListModalOpen(true);
                }}
                className='text-gray-400 hover:text-brand-primary transition-colors cursor-pointer text-lg leading-none' 
                title="Add new list"
              >
                +
              </button>
          </div>
          {[
            { name: 'Personal', color: 'bg-blue-400' },
            { name: 'Work', color: 'bg-orange-400' },
            { name: 'Study', color: 'bg-green-400' },
            ...customLists.filter(l => l.name !== 'Personal' && l.name !== 'Work' && l.name !== 'Study')
          ].map((list) => {
            const isActive = activeTab === list.name;
            return (
              <div
                key={list._id || list.name}
                onClick={() => handleTabClick(list.name)}
                className={`group flex items-center justify-between w-full p-2 cursor-pointer rounded text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-neutral-800 text-white font-medium'
                    : 'hover:bg-neutral-800/50 text-gray-400 hover:text-white'
                } ${collapsed ? 'lg:justify-center' : ''}`}
              >
                <div className='flex items-center gap-3'>
                  <span className={`w-2.5 h-2.5 rounded-full ${list.color || 'bg-blue-400'}`} />
                  <p className={`${collapsed ? 'lg:hidden block' : 'block'}`}>{list.name}</p>
                </div>
                {list._id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete the "${list.name}" list?`)) {
                        if (onDeleteList) onDeleteList(list._id, list.name);
                      }
                    }}
                    className={`opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all duration-200 px-1 cursor-pointer ${collapsed ? 'lg:hidden' : ''}`}
                    aria-label={`Delete ${list.name} list`}
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <CreateListModal 
          isOpen={isListModalOpen} 
          onClose={() => setIsListModalOpen(false)} 
          onCreate={onCreateList} 
        />

        <SettingsModal 
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          initialTab={settingsTab}
        />
        <ProPlanModal 
          isOpen={isProModalOpen}
          onClose={() => setIsProModalOpen(false)}
        />
      </div>
    </>
  )
}

export default Sidebar