import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Send,
  CheckSquare,
  History,
  Tag,
  Calendar,
  BarChart3,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Sidebar() {
  const { activeTab, setActiveTab, stats, holidays } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      iconColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
    },
    {
      id: 'apply',
      label: 'Apply Leave',
      icon: Send,
      iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30',
      badge: 'HR / Manager',
      badgeColor: 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
    },
    {
      id: 'holidays',
      label: 'Holiday Calendar',
      icon: CalendarDays,
      iconColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
      badge: holidays.length ? `${holidays.length} Holidays` : '2026',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
    },
    {
      id: 'approvals',
      label: 'Leave Approvals',
      icon: CheckSquare,
      iconColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
      badge: stats?.pendingApprovals ? `${stats.pendingApprovals}` : null,
      badgeColor: 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30 animate-pulse'
    },
    {
      id: 'history',
      label: 'Leave History',
      icon: History,
      iconColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30'
    },
    {
      id: 'calendar',
      label: 'Interactive Calendar',
      icon: Calendar,
      iconColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30'
    },
    {
      id: 'types',
      label: 'Leave Types',
      icon: Tag,
      iconColor: 'text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30'
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      iconColor: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30'
    },
    {
      id: 'settings',
      label: 'Policy Settings',
      icon: Sliders,
      iconColor: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
    }
  ];

  return (
    <aside className="w-full lg:w-64 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200/90 dark:border-slate-800/80 p-3 lg:p-4 flex flex-col justify-between shrink-0 transition-colors duration-200">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Navigation
        </div>

        <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap lg:whitespace-normal w-full text-left group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-slate-100 hover:bg-indigo-50/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : `${item.iconColor} group-hover:scale-105 shadow-sm`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border hidden sm:inline-block ${
                      isActive ? 'bg-white/25 text-white border-white/40' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2026 Engine Banner */}
      <div className="hidden lg:block mt-6 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/70 dark:via-slate-900 dark:to-slate-900 border border-indigo-200/70 dark:border-indigo-500/20 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Active 2026 Calendar</span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          Pre-configured with all 25 company holidays & automated validation engine.
        </p>
      </div>
    </aside>
  );
}
