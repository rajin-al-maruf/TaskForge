import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaCheckCircle, FaFire, FaChartPie, FaCrown, FaLightbulb, FaClock, FaStopwatch, FaChevronDown } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-brand-surface border border-neutral-800/60 rounded-xl p-5 shadow-sm flex items-center justify-between transition-all hover:border-neutral-700">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">{title}</p>
      <p className="text-3xl font-semibold text-white">{value}</p>
    </div>
    <div className={`h-12 w-12 rounded-full flex items-center justify-center bg-neutral-900 border border-white/5 ${colorClass}`}>
      <Icon size={22} />
    </div>
  </div>
);

// Modern Minimal Tooltip for the Bar Chart
const CustomTooltip = ({ active, payload, label, chartView, activeBar }) => {
  // Always render so Recharts can track position, but use CSS to hide it unless hovering a bar
  if (active && payload && payload.length) {
    const isTasks = chartView === 'tasks';
    const isVisible = label === activeBar;
    
    return (
      <div className={`bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/80 shadow-xl rounded-lg py-1.5 px-3 flex flex-col gap-0.5 pointer-events-none transition-all duration-200 origin-bottom ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <span className="text-gray-500 text-[9px] font-semibold uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isTasks ? 'bg-brand-primary' : 'bg-teal-400'}`} />
          <span className="text-white font-medium text-xs">
            {payload[0].value} <span className="text-gray-500 font-normal ml-0.5">{isTasks ? 'tasks' : 'min'}</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Modern Minimal Tooltip for Pie Charts
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.name === 'No Tasks') return null;
    return (
      <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/80 shadow-xl rounded-lg py-1.5 px-3 flex flex-col gap-0.5 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
        <span className="text-gray-500 text-[9px] font-semibold uppercase tracking-widest">{data.name}</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="text-white font-medium text-xs">
            {payload[0].value} <span className="text-gray-500 font-normal ml-0.5">tasks</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

// Modern Minimal Tooltip for Radar Chart
const CustomRadarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (label === 'No Tasks') return null;
    return (
      <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800/80 shadow-xl rounded-lg py-1.5 px-3 flex flex-col gap-0.5 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
        <span className="text-gray-500 text-[9px] font-semibold uppercase tracking-widest">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
          <span className="text-white font-medium text-xs">
            {payload[0].value} <span className="text-gray-500 font-normal ml-0.5">tasks</span>
          </span>
        </div>
      </div>
    );
  }
  return null;
};

const PerformanceAnalysis = ({ tasks = [] }) => {
  const [chartView, setChartView] = useState('tasks'); // 'tasks' | 'focus'
  const [timeRange, setTimeRange] = useState('7'); // '7' | '28'
  const [activeBar, setActiveBar] = useState(null);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const timeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) {
        setIsTimeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Real Analytics Data Processing ---
  const {
    currentTrendData,
    currentPriorityData,
    currentCategoryData,
    currentOnTimeData,
    totalCompleted,
    completionRate,
    onTimeRate,
    focusTimeStr,
    currentStreak,
    bestDayName
  } = useMemo(() => {
    const days = parseInt(timeRange);
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(now.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // 1. Initialize Trend Array (Guarantees strictly chronological sorting!)
    const trendArray = [];
    const trendMap = {};
    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const matchKey = d.toLocaleDateString('en-CA');
        const displayKey = days === 1 ? 'Today' : days === 7 ? d.toLocaleDateString('en-US', { weekday: 'short' }) : `${d.getMonth() + 1}/${d.getDate()}`;
        const item = { day: displayKey, tasks: 0, focusTime: 0 };
        trendArray.push(item);
        trendMap[matchKey] = item;
    }

    let completedInTimeframe = 0;
    let focusMin = 0;
    let onTime = 0;
    let overdue = 0;
    let priorityCounts = { high: 0, medium: 0, low: 0, none: 0 };
    const categoryCounts = {};
    const completedDates = new Set();

    // 2. Process all tasks
    tasks.forEach(task => {
        const isCompleted = task.status === 'completed';
        
        if (isCompleted) {
            // Use the specific completed time to ensure trends and streaks map perfectly
            const completedAt = task.completedAt ? new Date(task.completedAt) : (task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt));
            const taskDateKey = completedAt.toLocaleDateString('en-CA'); 
            
            completedDates.add(taskDateKey);
            
            // ONLY calculate metrics if task was completed within the selected timeframe
            if (completedAt >= startDate && completedAt <= now) {
                completedInTimeframe++;

                if (priorityCounts[task.priority] !== undefined) priorityCounts[task.priority]++;
                else priorityCounts.none++;

                const listName = task.list || 'Personal';
                categoryCounts[listName] = (categoryCounts[listName] || 0) + 1;

                if (task.dueDate) {
                    const dueDate = new Date(task.dueDate);
                    const completedAtDateOnly = new Date(completedAt);
                    dueDate.setHours(0, 0, 0, 0);
                    completedAtDateOnly.setHours(0, 0, 0, 0);
                    
                    if (completedAtDateOnly <= dueDate) onTime++;
                    else overdue++;
                } else {
                    onTime++;
                }

                if (trendMap[taskDateKey]) {
                    trendMap[taskDateKey].tasks++;
                    const focus = Number(task.timeEstimate) || 25;
                    trendMap[taskDateKey].focusTime += focus;
                    focusMin += focus;
                }
            }
        }
    });

    // 3. Calculate Current Streak
    let streak = 0;
    const checkDate = new Date();
    while (true) {
        const key = checkDate.toLocaleDateString('en-CA');
        if (completedDates.has(key)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (streak === 0 && checkDate.toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA')) {
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    const sortedTrend = [...trendArray].sort((a,b) => b.tasks - a.tasks);
    const bestDay = sortedTrend.length > 0 && sortedTrend[0].tasks > 0 ? sortedTrend[0].day : 'recently';

    const priorityData = [
        { name: 'High', value: priorityCounts.high, color: '#ef4444' },
        { name: 'Medium', value: priorityCounts.medium, color: '#eab308' },
        { name: 'Low', value: priorityCounts.low, color: '#22c55e' },
        { name: 'None', value: priorityCounts.none, color: '#6b7280' },
    ].filter(p => p.value > 0);

    const categoryData = Object.keys(categoryCounts).map(list => ({
        list,
        tasks: categoryCounts[list],
        fullMark: Math.max(10, ...Object.values(categoryCounts))
    }));

    const onTimeData = [
        { name: 'On Time', value: onTime, color: '#4ade80' },
        { name: 'Overdue', value: overdue, color: '#f87171' }
    ].filter(o => o.value > 0);

    // Overall completion rate (Lifetime active vs completed)
    const totalActive = tasks.filter(t => t.status !== 'completed' && !t.isArchived).length;
    const totalLifetimeCompleted = tasks.filter(t => t.status === 'completed').length;
    const completionRateNum = (totalActive + totalLifetimeCompleted) > 0 ? Math.round((totalLifetimeCompleted / (totalActive + totalLifetimeCompleted)) * 100) : 0;

    // Punctuality rate (On time vs overdue for timeframe)
    const onTimeRateNum = (onTime + overdue) > 0 ? Math.round((onTime / (onTime + overdue)) * 100) : 0;

    return {
      currentTrendData: trendArray,
      currentPriorityData: priorityData.length ? priorityData : [{ name: 'No Tasks', value: 1, color: '#334155' }],
      currentCategoryData: categoryData.length ? categoryData : [{ list: 'No Tasks', tasks: 1, fullMark: 10 }],
      currentOnTimeData: onTimeData.length ? onTimeData : [{ name: 'No Tasks', value: 1, color: '#334155' }],
      totalCompleted: completedInTimeframe,
      completionRate: `${completionRateNum}%`,
      onTimeRate: `${onTimeRateNum}%`,
      focusTimeStr: `${Math.floor(focusMin / 60)}h ${focusMin % 60}m`,
      currentStreak: `${streak} Days`,
      bestDayName: bestDay
    };
  }, [tasks, timeRange]);

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 px-2 lg:px-6 mt-6">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand-primary mb-1">Insights</p>
          <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
            Performance Analysis 
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase tracking-wider rounded border border-yellow-500/20">
              <FaCrown size={10} /> Pro
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">Track your productivity trends and task completion metrics.</p>
        </div>
        
        {/* Global Time Range Selector */}
        <div className="relative shrink-0 z-30 w-40" ref={timeDropdownRef}>
          <button
            type="button"
            onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
            className="flex items-center justify-between w-full bg-neutral-900/80 backdrop-blur-md border border-neutral-800 text-white text-sm font-medium py-2.5 px-4 rounded-xl outline-none focus:border-brand-primary transition-colors cursor-pointer shadow-sm hover:bg-neutral-800"
          >
            <span>{timeRange === '1' ? 'Today' : timeRange === '7' ? 'Last 7 Days' : 'Last 28 Days'}</span>
            <FaChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`absolute top-full right-0 mt-2 w-40 bg-brand-surface border border-neutral-800/80 rounded-xl shadow-2xl py-1.5 z-50 transition-all duration-200 origin-top-right ${isTimeDropdownOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            {[
              { value: '1', label: 'Today' },
              { value: '7', label: 'Last 7 Days' },
              { value: '28', label: 'Last 28 Days' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setTimeRange(option.value);
                  setIsTimeDropdownOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left transition-colors cursor-pointer ${
                  timeRange === option.value 
                    ? 'bg-brand-primary/10 text-brand-primary font-semibold' 
                    : 'text-gray-300 hover:bg-neutral-800 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Full-Page Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN (Charts & Stats - Spans 3/4) */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Completed" value={totalCompleted} icon={FaCheckCircle} colorClass="text-brand-primary" />
            <StatCard title="Completion Rate" value={completionRate} icon={FaChartPie} colorClass="text-green-400" />
            <StatCard title="Total Focus Time" value={focusTimeStr} icon={FaStopwatch} colorClass="text-teal-400" />
            <StatCard title="Current Streak" value={currentStreak} icon={FaFire} colorClass="text-orange-500" />
          </div>

          {/* Main Toggle Chart (Tasks or Focus Time) */}
          <div className="bg-brand-surface border border-neutral-800/60 rounded-xl p-6 shadow-sm outline-none">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-semibold text-white">
                {chartView === 'tasks' ? 'Productivity Trend' : 'Focus Time'} 
                <span className="text-gray-500 font-normal ml-2 hidden sm:inline">({timeRange === '1' ? 'Today' : `Last ${timeRange} Days`})</span>
              </h3>
              
              <div className="flex items-center gap-3">
                {/* Metric Toggle */}
                <div className="inline-flex bg-neutral-900/50 rounded-lg p-1 border border-neutral-800/80">
                  <button
                    onClick={() => setChartView('tasks')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${chartView === 'tasks' ? 'bg-neutral-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Tasks
                  </button>
                  <button
                    onClick={() => setChartView('focus')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${chartView === 'focus' ? 'bg-neutral-800 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Focus
                  </button>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentTrendData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                  
                  {/* Setting cursor={false} removes the gray background bar */}
                  <Tooltip 
                    cursor={false} 
                    content={<CustomTooltip chartView={chartView} activeBar={activeBar} />} 
                    isAnimationActive={false}
                    wrapperStyle={{ zIndex: 20 }}
                  />
                  
                  {chartView === 'tasks' ? (
                    <Bar 
                      name="Tasks Completed" 
                      dataKey="tasks" 
                      fill="var(--color-brand-primary)" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={40} 
                      onMouseEnter={(data) => setActiveBar(data?.payload?.day || data?.day)}
                      onMouseLeave={() => setActiveBar(null)}
                    >
                      {currentTrendData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill="var(--color-brand-primary)"
                          className="transition-all duration-300 cursor-pointer outline-none"
                        />
                      ))}
                    </Bar>
                  ) : (
                    <Bar 
                      name="Focus Time (min)" 
                      dataKey="focusTime" 
                      fill="#2dd4bf" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={40} 
                      onMouseEnter={(data) => setActiveBar(data?.payload?.day || data?.day)}
                      onMouseLeave={() => setActiveBar(null)}
                    >
                      {currentTrendData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill="#2dd4bf"
                          className="transition-all duration-300 cursor-pointer outline-none"
                        />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Data Row (3 Charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Priority Breakdown Donut Chart */}
            <div className="bg-brand-surface border border-neutral-800/60 rounded-xl p-6 shadow-sm flex flex-col h-full outline-none">
              <h3 className="text-sm font-semibold text-white mb-2">Priority Breakdown</h3>
              <p className="text-xs text-gray-500 mb-6">Distribution of completed tasks.</p>
              <div className="flex-1 h-[200px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={currentPriorityData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none"
                    >
                      {currentPriorityData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          className="transition-all duration-300 cursor-pointer outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip cursor={false} content={<CustomPieTooltip />} isAnimationActive={false} wrapperStyle={{ zIndex: 20 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">{totalCompleted}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Tasks</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {currentPriorityData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            {/* Category Focus Radar Chart */}
            <div className="bg-brand-surface border border-neutral-800/60 rounded-xl p-6 shadow-sm flex flex-col h-full outline-none">
              <h3 className="text-sm font-semibold text-white mb-2">Category Focus</h3>
              <p className="text-xs text-gray-500 mb-2">Tasks completed by list.</p>
              <div className="flex-1 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={currentCategoryData}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis dataKey="list" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Tooltip cursor={false} content={<CustomRadarTooltip />} isAnimationActive={false} wrapperStyle={{ zIndex: 20 }} />
                    <Radar name="Tasks" dataKey="tasks" stroke="var(--color-brand-primary)" fill="var(--color-brand-primary)" fillOpacity={0.4} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Punctuality Donut Chart */}
            <div className="bg-brand-surface border border-neutral-800/60 rounded-xl p-6 shadow-sm flex flex-col h-full outline-none">
              <h3 className="text-sm font-semibold text-white mb-2">Punctuality</h3>
              <p className="text-xs text-gray-500 mb-6">On-time vs overdue completions.</p>
              <div className="flex-1 h-[200px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={currentOnTimeData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none"
                    >
                      {currentOnTimeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          className="transition-all duration-300 cursor-pointer outline-none"
                        />
                      ))}
                    </Pie>
                    <Tooltip cursor={false} content={<CustomPieTooltip />} isAnimationActive={false} wrapperStyle={{ zIndex: 20 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <FaClock size={20} className="text-brand-primary mb-1 opacity-80" />
                  <span className="text-xl font-bold text-white">{onTimeRate}</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {currentOnTimeData.map(item => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Insights - Spans 1/4) */}
        <div className="xl:col-span-1 bg-brand-surface border border-neutral-800/60 rounded-xl p-6 shadow-sm flex flex-col sticky top-6">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" /> Smart Insights
          </h3>
          <div className="space-y-4 flex-1">
            <div className="p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg">
              <p className="text-xs font-semibold text-brand-primary mb-1">Deep Work Master</p>
              <p className="text-xs text-gray-300">You've logged <strong className="text-white font-semibold">{focusTimeStr}</strong> of focused deep work {timeRange === '1' ? 'today' : `over the last ${timeRange} days`}!</p>
            </div>
            <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-lg">
              <p className="text-xs font-semibold text-gray-300 mb-1">Peak Productivity</p>
              <p className="text-[11px] text-gray-500">You complete the most tasks on <strong className="text-brand-primary font-semibold">{bestDayName}</strong>. Keep it up!</p>
            </div>
            <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-lg">
              <p className="text-xs font-semibold text-gray-300 mb-1">Task Completion</p>
              <p className="text-[11px] text-gray-500">You have an overall task completion rate of <strong className="text-brand-primary font-semibold">{completionRate}</strong>!</p>
            </div>
            <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-lg">
              <p className="text-xs font-semibold text-gray-300 mb-1">Consistency</p>
              <p className="text-[11px] text-gray-500">You have a current streak of <strong className="text-brand-primary font-semibold">{currentStreak}</strong>! Keep the momentum going.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerformanceAnalysis;