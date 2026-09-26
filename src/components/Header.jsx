import React from 'react';
import { Calendar, PlusCircle, ShieldCheck, Clock, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

export default function Header() {
  const { navigateToApply, stats, policy, theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/80 px-4 lg:px-8 py-3.5 shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-md shadow-indigo-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-white dark:bg-slate-950/80 rounded-[14px] flex items-center justify-center backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 dark:from-white dark:via-slate-100 dark:to-indigo-200 bg-clip-text text-transparent">
                LeaveManager Pro
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20">
                2026 Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              HR Holiday Calendar & Policy Validation System
            </p>
          </div>
        </div>

        {/* Status Indicators & CTA */}
        <div className="flex items-center gap-3">
          {/* Policy Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-500 dark:text-slate-400">Policy:</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-400">
              {policy?.excludeFixedHolidays ? 'Fixed Excluded' : 'All Days Counted'}
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {policy?.directApproval ? 'Direct Approval' : 'Workflow Review'}
            </span>
          </div>

          {/* Pending Badge */}
          {stats?.pendingApprovals > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-xs font-bold text-amber-800 dark:text-amber-300 shadow-sm animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>{stats.pendingApprovals} Pending Approval</span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all hover:scale-105 shadow-sm"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Quick Apply Button */}
          <button
            onClick={() => navigateToApply()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/35 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>
    </header>
  );
}
