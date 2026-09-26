import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Star,
  Check,
  RotateCcw
} from 'lucide-react';
import { formatNiceDate } from './DayBreakdownStrip.jsx';

export default function DateRangeCalendarPicker({
  fromDate,
  endDate,
  onDateRangeChange,
  holidays = []
}) {
  // Parse initial date to set initial calendar view month & year
  const initialYear = fromDate ? parseInt(fromDate.split('-')[0], 10) : 2026;
  const initialMonth = fromDate ? parseInt(fromDate.split('-')[1], 10) - 1 : 7; // Aug 2026 by default

  const [viewYear, setViewYear] = useState(initialYear || 2026);
  const [viewMonth, setViewMonth] = useState(initialMonth ?? 7);
  const [hoverDate, setHoverDate] = useState(null);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(prev => prev - 1);
    } else {
      setViewMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(prev => prev + 1);
    } else {
      setViewMonth(prev => prev + 1);
    }
  };

  // Build a lookup map of active holidays: dateStr -> holiday
  const holidayMap = useMemo(() => {
    const map = new Map();
    holidays.forEach(h => {
      if (h.status === 'Active' && h.date) {
        map.set(h.date, h);
      }
    });
    return map;
  }, [holidays]);

  // Generate grid days for current view month
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(Date.UTC(viewYear, viewMonth, 1));
    const startDayIndex = firstDay.getUTCDay(); // 0 is Sunday
    const totalDays = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

    const cells = [];
    // Padding before 1st of month
    for (let i = 0; i < startDayIndex; i++) {
      cells.push({ empty: true, key: `empty-${i}` });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holiday = holidayMap.get(dateStr);
      cells.push({
        empty: false,
        day: d,
        dateStr,
        holiday,
        isWeekend: (startDayIndex + d - 1) % 7 === 0 || (startDayIndex + d - 1) % 7 === 6
      });
    }

    return cells;
  }, [viewYear, viewMonth, holidayMap]);

  // Handle clicking a day on the calendar
  const handleDayClick = (dateStr) => {
    if (!isSelectingEnd || !fromDate || fromDate > dateStr) {
      // Set new start date
      onDateRangeChange(dateStr, dateStr);
      setIsSelectingEnd(true);
    } else {
      // Set end date
      onDateRangeChange(fromDate, dateStr);
      setIsSelectingEnd(false);
    }
  };

  // Quick preset buttons
  const setQuickRange = (startStr, endStr) => {
    onDateRangeChange(startStr, endStr);
    setIsSelectingEnd(false);
    const yr = parseInt(startStr.split('-')[0], 10);
    const mo = parseInt(startStr.split('-')[1], 10) - 1;
    setViewYear(yr);
    setViewMonth(mo);
  };

  return (
    <div className="space-y-4">
      {/* Date Input Headers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* From Date Display / Input */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Start Date (From)</span>
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold">
              {fromDate ? formatNiceDate(fromDate) : 'Not selected'}
            </span>
          </label>
          <input
            type="date"
            required
            value={fromDate || ''}
            onChange={(e) => {
              const val = e.target.value;
              onDateRangeChange(val, endDate && endDate >= val ? endDate : val);
              if (val) {
                setViewYear(parseInt(val.split('-')[0], 10));
                setViewMonth(parseInt(val.split('-')[1], 10) - 1);
              }
            }}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* End Date Display / Input */}
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <label className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider block flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>End Date (To)</span>
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-300 font-bold">
              {endDate ? formatNiceDate(endDate) : 'Not selected'}
            </span>
          </label>
          <input
            type="date"
            required
            value={endDate || ''}
            onChange={(e) => {
              const val = e.target.value;
              onDateRangeChange(fromDate, val);
              if (val) {
                setViewYear(parseInt(val.split('-')[0], 10));
                setViewMonth(parseInt(val.split('-')[1], 10) - 1);
              }
            }}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Interactive Calendar Selection Container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {/* Month Navigation & Presets Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors shadow-xs"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-extrabold text-sm text-slate-900 dark:text-white px-2 min-w-[130px] text-center">
              {monthNames[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors shadow-xs"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
            <span className="text-slate-500 font-bold mr-1">Presets:</span>
            <button
              type="button"
              onClick={() => setQuickRange('2026-08-14', '2026-08-16')}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800 font-bold transition-colors shadow-xs"
              title="14-16 Aug (Fixed Holiday test)"
            >
              14–16 Aug
            </button>
            <button
              type="button"
              onClick={() => setQuickRange('2026-01-13', '2026-01-13')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 font-bold transition-colors shadow-xs"
              title="Lohri (Optional Holiday test)"
            >
              13 Jan (Lohri)
            </button>
            <button
              type="button"
              onClick={() => setQuickRange('2026-08-28', '2026-08-28')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 font-bold transition-colors shadow-xs"
              title="Rakshabandhan (Optional Holiday test)"
            >
              28 Aug (Rakshabandhan)
            </button>
            <button
              type="button"
              onClick={() => setQuickRange('2026-10-01', '2026-10-05')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 dark:border-slate-800 font-bold transition-colors shadow-xs"
              title="1-5 Oct (Gandhi Jayanti test)"
            >
              1–5 Oct
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-1">
          <span className="text-rose-600 dark:text-rose-400 font-bold">Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span className="text-rose-600 dark:text-rose-400 font-bold">Sat</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5" onMouseLeave={() => setHoverDate(null)}>
          {daysInMonth.map((cell) => {
            if (cell.empty) {
              return <div key={cell.key} className="h-11 rounded-xl bg-transparent" />;
            }

            const { day, dateStr, holiday, isWeekend } = cell;

            const isStart = dateStr === fromDate;
            const isEnd = dateStr === endDate;
            const isInRange = fromDate && endDate && dateStr >= fromDate && dateStr <= endDate;
            const isHovering = isSelectingEnd && fromDate && hoverDate && dateStr >= fromDate && dateStr <= hoverDate;

            const isFixed = holiday?.type === 'Fixed';
            const isOptional = holiday?.type === 'Optional';

            return (
              <button
                type="button"
                key={dateStr}
                onClick={() => handleDayClick(dateStr)}
                onMouseEnter={() => {
                  if (isSelectingEnd) setHoverDate(dateStr);
                }}
                className={`h-11 rounded-xl p-1 relative flex flex-col items-center justify-between text-xs font-bold transition-all group ${
                  isStart || isEnd
                    ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 text-white shadow-md shadow-indigo-500/30 scale-105 z-10'
                    : isInRange || isHovering
                    ? 'bg-indigo-100 dark:bg-indigo-600/25 text-indigo-900 dark:text-indigo-100 border border-indigo-300 dark:border-indigo-500/40'
                    : isFixed
                    ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 shadow-xs'
                    : isOptional
                    ? 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 shadow-xs'
                    : isWeekend
                    ? 'bg-slate-100/70 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400'
                    : 'bg-white hover:bg-indigo-50/50 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 shadow-xs'
                }`}
                title={holiday ? `${holiday.name} (${holiday.type} Holiday)` : dateStr}
              >
                {/* Date Number */}
                <span className="text-[11px] leading-none mt-0.5">{day}</span>

                {/* Holiday Indicator Badge */}
                {holiday && (
                  <span
                    className={`text-[8px] px-1 py-0.2 rounded-full font-black uppercase truncate max-w-full leading-tight ${
                      isStart || isEnd
                        ? 'bg-white/20 text-white'
                        : isFixed
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300'
                    }`}
                  >
                    {isFixed ? 'Fixed' : 'Opt'}
                  </span>
                )}

                {/* Selection Marker */}
                {(isStart || isEnd) && (
                  <div className="w-1 h-1 rounded-full bg-white mb-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Calendar Legend Footer */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-600" />
              <span className="font-semibold text-rose-700 dark:text-rose-400">Fixed Holiday</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-600" />
              <span className="font-semibold text-amber-700 dark:text-amber-400">Optional Holiday</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-indigo-700" />
              <span className="font-semibold text-indigo-700 dark:text-indigo-400">Selected Range</span>
            </span>
          </div>

          <span className="text-slate-500 dark:text-slate-400 italic font-medium">
            Click 1st date for Start Date, 2nd date for End Date
          </span>
        </div>
      </div>
    </div>
  );
}
