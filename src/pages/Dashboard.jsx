import React, { useState } from 'react';
import {
  Users,
  CalendarCheck,
  Clock,
  CalendarDays,
  ArrowUpRight,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Star,
  ShieldAlert,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { formatNiceDate } from '../components/DayBreakdownStrip.jsx';
import ApprovalActionModal from '../components/ApprovalActionModal.jsx';

export default function Dashboard() {
  const {
    stats,
    holidays,
    leaveRequests,
    policy,
    navigateToApply,
    setActiveTab,
    refreshLeaveRequests,
    refreshStats
  } = useApp();

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('Approve');

  // Next upcoming holidays in 2026
  const upcomingHolidays = [...holidays]
    .filter(h => h.status === 'Active')
    .slice(0, 5);

  const pendingRequests = leaveRequests.filter(r => r.status === 'Pending').slice(0, 4);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-900/80 dark:via-purple-900/60 dark:to-slate-900 text-white shadow-xl shadow-indigo-500/15 p-6 lg:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HR Leave & 2026 Holiday Portal</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Enterprise Leave Management System
            </h2>
            <p className="text-sm text-indigo-100 dark:text-slate-300 leading-relaxed font-medium">
              Automate leave approvals, manage Fixed and Optional company holidays, and calculate net employee leave days without policy conflicts.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-3">
            <button
              onClick={() => navigateToApply()}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-700 font-extrabold text-sm shadow-lg shadow-black/10 active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Apply Employee Leave</span>
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-sm font-bold backdrop-blur-sm transition-all"
            >
              <CalendarDays className="w-4 h-4 text-white" />
              <span>View 2026 Holidays</span>
            </button>
          </div>
        </div>

        {/* Ambient background blur circles */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Colorful KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Employees */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 dark:bg-slate-900/70 border border-blue-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-blue-700 dark:text-blue-400 block tracking-wider">
              Active Employees
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalEmployees ?? 5}
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Ready for leave requests</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Leaves Applied */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-white to-purple-50/40 dark:bg-slate-900/70 border border-indigo-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-indigo-700 dark:text-indigo-400 block tracking-wider">
              Total Applications
            </span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {stats?.totalRequests ?? 0}
            </div>
            <span className="text-[11px] text-indigo-600 dark:text-slate-400 font-semibold">
              {stats?.totalLeaveDaysApproved ?? 0} days approved
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50/90 via-white to-orange-50/40 dark:bg-slate-900/70 border border-amber-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-amber-800 dark:text-amber-400 block tracking-wider">
              Pending Approvals
            </span>
            <div className="text-3xl font-black text-amber-700 dark:text-amber-400 mt-1">
              {stats?.pendingApprovals ?? 0}
            </div>
            <span className="text-[11px] text-amber-800 dark:text-amber-400 font-bold">Awaiting manager action</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/25 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* 2026 Company Holidays */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 dark:bg-slate-900/70 border border-emerald-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-emerald-800 dark:text-emerald-400 block tracking-wider">
              2026 Holidays
            </span>
            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
              {stats?.totalHolidays2026 ?? 25}
            </div>
            <span className="text-[11px] text-emerald-900/80 dark:text-slate-400 font-semibold">
              {stats?.fixedHolidaysCount ?? 12} Fixed • {stats?.optionalHolidaysCount ?? 13} Optional
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/25 flex items-center justify-center">
            <CalendarDays className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Pending Requests Queue (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Pending Manager Review Queue</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Requests requiring immediate approval or rejection</p>
              </div>
              <button
                onClick={() => setActiveTab('approvals')}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <span className="font-semibold">All caught up! No pending leave requests right now.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req._id || req.leaveId}
                    className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20">
                        {req.employeeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-200">{req.employeeName}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300">
                            {req.leaveTypeName}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {formatNiceDate(req.fromDate)} – {formatNiceDate(req.endDate)} ({req.leaveDays} {req.leaveDays === 1 ? 'day' : 'days'})
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType('Approve');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setActionType('Reject');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-600/20 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Policy Summary Card */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Active Holiday Policy Engine</span>
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                Fixed holidays falling within leave spans are automatically deducted from leave days.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-white text-xs font-bold border border-slate-300/80 dark:border-slate-700 whitespace-nowrap transition-colors"
            >
              Configure Policy
            </button>
          </div>
        </div>

        {/* Right: Upcoming 2026 Company Holidays (1 col) */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  <span>2026 Official Holidays</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">From company holiday schedule</p>
              </div>
              <button
                onClick={() => setActiveTab('holidays')}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 flex items-center gap-1"
              >
                <span>Full List</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingHolidays.map((h) => {
                const isFixed = h.type === 'Fixed';
                return (
                  <div
                    key={h.holidayId}
                    className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-all shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-200">{h.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{formatNiceDate(h.date)}</div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isFixed
                          ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30'
                          : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                      }`}
                    >
                      {isFixed ? <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" /> : <Star className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                      <span>{h.type}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {selectedRequest && (
        <ApprovalActionModal
          request={selectedRequest}
          actionType={actionType}
          onClose={() => setSelectedRequest(null)}
          onSuccess={() => {
            refreshLeaveRequests();
            refreshStats();
          }}
        />
      )}
    </div>
  );
}
