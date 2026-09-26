import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Star,
  User,
  PlusCircle,
  CalendarDays,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function InteractiveCalendar() {
  const { holidays, leaveRequests, navigateToApply } = useApp();

  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = Jan, 7 = Aug, etc.

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generate calendar days for month
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
    const startDayIndex = firstDay.getUTCDay(); // 0 is Sunday
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();

    const days = [];

    // Blank cells before first day
    for (let i = 0; i < startDayIndex; i++) {
      days.push({ empty: true, key: `empty-${i}` });
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      // Find holidays
      const holiday = holidays.find(h => h.date === dateStr && h.status === 'Active');

      // Find leaves
      const matchingLeaves = leaveRequests.filter(r => {
        if (!r.fromDate || !r.endDate) return false;
        return r.fromDate <= dateStr && dateStr <= r.endDate && r.status !== 'Rejected' && r.status !== 'Cancelled';
      });

      days.push({
        empty: false,
        day: d,
        dateStr,
        holiday,
        leaves: matchingLeaves,
        isWeekend: (startDayIndex + d - 1) % 7 === 0 || (startDayIndex + d - 1) % 7 === 6
      });
    }

    return days;
  }, [currentYear, currentMonth, holidays, leaveRequests]);

  const handleDateClick = (dateStr, holiday) => {
    navigateToApply({
      date: dateStr,
      leaveTypeId: holiday?.type === 'Optional' ? 'LT-02' : 'LT-01'
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Interactive Leave & Holiday Calendar</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
            Visual month-by-month grid displaying company fixed holidays, floating optional holidays, and employee leaves.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30 font-bold shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Fixed Holiday</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30 font-bold shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Optional Holiday</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30 font-bold shadow-xs">
            <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Employee Leave</span>
          </div>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-black text-lg text-slate-900 dark:text-white">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 transition-colors shadow-xs"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(0);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-bold shadow-xs"
          >
            Jump to Jan 2026
          </button>
          <button
            onClick={() => {
              setCurrentYear(2026);
              setCurrentMonth(7); // Aug
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-600/30 dark:hover:bg-indigo-600/50 dark:text-indigo-300 text-xs font-bold shadow-xs"
          >
            Jump to Aug 2026
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          <div className="py-2 text-rose-600 dark:text-rose-400 font-bold">Sun</div>
          <div className="py-2">Mon</div>
          <div className="py-2">Tue</div>
          <div className="py-2">Wed</div>
          <div className="py-2">Thu</div>
          <div className="py-2">Fri</div>
          <div className="py-2 text-rose-600 dark:text-rose-400 font-bold">Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarGrid.map((item, idx) => {
            if (item.empty) {
              return <div key={item.key} className="min-h-[105px] rounded-2xl bg-slate-50/50 dark:bg-slate-950/20" />;
            }

            const { day, dateStr, holiday, leaves, isWeekend } = item;
            const isFixed = holiday?.type === 'Fixed';
            const isOptional = holiday?.type === 'Optional';

            return (
              <div
                key={dateStr}
                onClick={() => handleDateClick(dateStr, holiday)}
                className={`min-h-[105px] p-2.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between shadow-xs ${
                  isFixed
                    ? 'bg-rose-50/80 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 hover:border-rose-400'
                    : isOptional
                    ? 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 hover:border-amber-400'
                    : isWeekend
                    ? 'bg-slate-100/60 dark:bg-slate-950/40 border-slate-200/70 dark:border-slate-800/50 hover:border-slate-300'
                    : 'bg-slate-50/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800/80 hover:border-indigo-400'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${
                    isFixed ? 'text-rose-700 dark:text-rose-400' : isOptional ? 'text-amber-800 dark:text-amber-400' : isWeekend ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {day}
                  </span>

                  <button
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-indigo-600 dark:text-indigo-400 hover:scale-110"
                    title="Apply leave starting this day"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Holiday Badge */}
                {holiday && (
                  <div className={`mt-1 px-1.5 py-1 rounded-lg text-[10px] font-bold truncate border ${
                    isFixed
                      ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                      : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                  }`}>
                    {holiday.name}
                  </div>
                )}

                {/* Employee Leaves */}
                <div className="space-y-1 mt-1">
                  {leaves.slice(0, 2).map((l, i) => (
                    <div
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 truncate"
                      title={`${l.employeeName} (${l.leaveTypeName})`}
                    >
                      {l.employeeName.split(' ')[0]} - {l.leaveTypeName.split(' ')[0]}
                    </div>
                  ))}
                  {leaves.length > 2 && (
                    <div className="text-[9px] text-slate-500 font-bold text-center">
                      +{leaves.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
