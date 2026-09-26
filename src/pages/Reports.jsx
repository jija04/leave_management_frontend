import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Star,
  Users,
  CheckCircle2,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

export default function Reports() {
  const { showToast, theme } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setData(res.data);
      } catch (err) {
        showToast(err.message || 'Failed to load report analytics', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [showToast]);

  const COLORS = ['#4f46e5', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981'];

  const isDark = theme === 'dark';
  const gridColor = isDark ? '#334155' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = isDark
    ? { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px', color: '#f8fafc' }
    : { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Reports & Leave Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
            Department utilization, leave type breakdown, and optional holiday adoption statistics.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-semibold">
          Loading analytics and charts...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: Charts (Dept Bar + Leave Type Pie) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Breakdown Bar Chart */}
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
                <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Department-Wise Leave Days</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total days applied across teams</p>

              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.departmentBreakdown || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.6} />
                    <XAxis dataKey="department" stroke={axisColor} fontSize={11} />
                    <YAxis stroke={axisColor} fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="totalDays" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leave Type Pie/Donut Chart */}
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
                <PieIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                <span>Leave Type Distribution</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Share of requests by leave category</p>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data?.leaveTypeBreakdown?.filter(t => t.count > 0) || []}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                    >
                      {(data?.leaveTypeBreakdown || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Legends */}
              <div className="flex flex-wrap justify-center gap-3 text-xs pt-2">
                {(data?.leaveTypeBreakdown || []).map((t, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{t.name} ({t.count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: 2026 Monthly Trend Area Chart */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>2026 Monthly Leave & Holiday Distribution</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Leaves requested vs company holidays per month</p>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyTrends || []}>
                  <defs>
                    <linearGradient id="leaveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="holidayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.6} />
                  <XAxis dataKey="month" stroke={axisColor} fontSize={11} />
                  <YAxis stroke={axisColor} fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="leaveDays" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#leaveGrad)" name="Leave Days" />
                  <Area type="monotone" dataKey="holidays" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#holidayGrad)" name="Company Holidays" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 3: Optional Holiday Utilization Report */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
              <Star className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <span>Optional Floating Holiday Adoption (2026)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Tracking how many employees have utilized each optional holiday from the calendar
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {(data?.optionalHolidayUtilization || []).map((h) => (
                <div
                  key={h.holidayId}
                  className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-950/60 border border-amber-200 dark:border-slate-800 flex items-center justify-between shadow-xs"
                >
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-200">{h.name}</h4>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block mt-0.5 font-bold">{h.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-amber-800 dark:text-amber-400">
                      {h.appliedCount}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">applications</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
