import { useState, useContext } from 'react';
import logo from '../assets/logo.png';
import { PiSidebarSimpleLight } from "react-icons/pi";
import { RiTaskLine } from "react-icons/ri";
import { FaRegCalendarAlt } from "react-icons/fa";
import { GrTarget } from "react-icons/gr";
import { toast } from 'sonner';
import CreateListModal from './CreateListModal.jsx';
import { AuthContext } from '../api/AuthContext.jsx';


const Sidebar = ({activeTab, setActiveTab, customLists = [], onCreateList, onDeleteList}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  
  const { user } = useContext(AuthContext);
  const isProUser = user?.userType === 'pro';
  const FREE_LIST_LIMIT = 3; // Free users can create up to 3 custom lists

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleToggle = () => {
    setCollapsed((prev) => !prev);
  };

  const tabItems = [
    { id: 'tasks', icon: RiTaskLine, label: 'My Tasks' },
    { id: 'today', icon: GrTarget, label: 'Today' },
    { id: 'calendar', icon: FaRegCalendarAlt, label: 'Calendar' }
  ];

  return (
    <div className={`sticky top-0 self-start h-screen bg-brand-surface p-4 text-gray-500 overflow-y-auto transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-72'}`}>
        <div className={`flex items-center mb-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && <img src={logo} alt="taskforge_logo" className='w-44'/>
          }
          <button
            onClick={handleToggle}
            className='cursor-pointer hover:text-brand-primary hover:bg-neutral-800 p-1 rounded transition-colors'
            aria-label={collapsed ? 'Open sidebar' : 'Collapse sidebar'}
          >
            <PiSidebarSimpleLight size={20} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
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
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={20}/>
                <p className={`${collapsed ? 'hidden' : 'block'}`}>{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Custom Lists Section */}
        <div className={`mt-8 flex flex-col gap-2 ${collapsed ? 'items-center' : ''}`}>
          {!collapsed && (
            <div className='flex items-center justify-between mb-2 px-2'>
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
          )}
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
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <div className='flex items-center gap-3'>
                  <span className={`w-2.5 h-2.5 rounded-full ${list.color || 'bg-blue-400'}`} />
                  <p className={`${collapsed ? 'hidden' : 'block'}`}>{list.name}</p>
                </div>
                {!collapsed && list._id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete the "${list.name}" list?`)) {
                        if (onDeleteList) onDeleteList(list._id, list.name);
                      }
                    }}
                    className='opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all duration-200 px-1 cursor-pointer'
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
    </div>
  )
}

export default Sidebar