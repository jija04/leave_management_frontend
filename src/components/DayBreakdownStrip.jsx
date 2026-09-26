import React from 'react';
import { Calendar, ShieldAlert, Star, Info } from 'lucide-react';

export function formatNiceDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC'
  });
}

export default function DayBreakdownStrip({ dayBreakdown = [], excludeFixedHolidays = true, isOptionalType = false }) {
  if (!dayBreakdown || dayBreakdown.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <span className="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
          <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          Day-by-Day Itemized Calendar Breakdown ({dayBreakdown.length} total {dayBreakdown.length === 1 ? 'day' : 'days'}):
        </span>
        <span className="text-slate-500 dark:text-slate-400 font-medium">
          {excludeFixedHolidays && !isOptionalType ? 'Fixed holidays excluded from leave count' : 'All requested days counted'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {dayBreakdown.map((item, idx) => {
          const isFixed = item.type === 'Fixed Holiday';
          const isOptional = item.type === 'Optional Holiday';

          return (
            <div
              key={idx}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
                isFixed
                  ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300'
                  : isOptional
                  ? 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-200'
              }`}
            >
              {/* Icon */}
              {isFixed ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
              ) : isOptional ? (
                <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              )}

              {/* Date */}
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatNiceDate(item.date)}</span>

              {/* Status Pill */}
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span>
                {isFixed ? (
                  <span className="text-rose-700 dark:text-rose-400 font-bold">
                    {item.holidayName} (Fixed Holiday {excludeFixedHolidays && !isOptionalType ? '- Not Deducted' : ''})
                  </span>
                ) : isOptional ? (
                  <span className="text-amber-800 dark:text-amber-400 font-bold">
                    {item.holidayName} (Optional Holiday)
                  </span>
                ) : (
                  <span className="text-indigo-700 dark:text-indigo-300 font-bold">
                    Leave Day
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
