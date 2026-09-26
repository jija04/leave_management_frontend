import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { formatNiceDate } from '../components/DayBreakdownStrip.jsx';
import DayBreakdownStrip from '../components/DayBreakdownStrip.jsx';

export default function LeaveHistory() {
  const { leaveRequests, employees, leaveTypes, policy } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [expandedRequestId, setExpandedRequestId] = useState(null);

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(r => {
      const matchEmp = selectedEmp === 'All' || r.employeeId === selectedEmp;
      const matchType = selectedType === 'All' || r.leaveTypeId === selectedType;
      const matchStatus = selectedStatus === 'All' || r.status.toLowerCase() === selectedStatus.toLowerCase();
      const matchSearch =
        r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.leaveId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchTerm.toLowerCase());
      return matchEmp && matchType && matchStatus && matchSearch;
    });
  }, [leaveRequests, selectedEmp, selectedType, selectedStatus, searchTerm]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRequests.length === 0) return;

    const headers = ['Leave ID', 'Employee ID', 'Employee Name', 'Department', 'Leave Type', 'From Date', 'End Date', 'Leave Days', 'Status', 'Reason', 'Applied By', 'Approved By'];
    const rows = filteredRequests.map(r => [
      r.leaveId,
      r.employeeId,
      `"${r.employeeName}"`,
      r.employeeDept || '',
      `"${r.leaveTypeName}"`,
      r.fromDate,
      r.endDate,
      r.leaveDays,
      r.status,
      `"${(r.reason || '').replace(/"/g, '""')}"`,
      `"${r.appliedBy || ''}"`,
      `"${r.approvedBy || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leave_records_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Employee Leave History</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
            Complete audit trail of all leave requests, itemized calendar days, and approval states.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-xs transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee, ID, reason..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Employee Filter */}
        <div>
          <select
            value={selectedEmp}
            onChange={(e) => setSelectedEmp(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Employees</option>
            {employees.map(e => (
              <option key={e.employeeId} value={e.employeeId}>
                {e.name} ({e.employeeId})
              </option>
            ))}
          </select>
        </div>

        {/* Leave Type Filter */}
        <div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Leave Types</option>
            {leaveTypes.map(lt => (
              <option key={lt.leaveTypeId} value={lt.leaveTypeId}>
                {lt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Leave ID</th>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Date Span</th>
                <th className="px-6 py-4">Net Days</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
              {filteredRequests.map((req) => {
                const isApproved = req.status === 'Approved';
                const isPending = req.status === 'Pending';
                const isExpanded = expandedRequestId === req.leaveId;

                return (
                  <React.Fragment key={req._id || req.leaveId}>
                    <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500 font-bold">{req.leaveId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-slate-200">{req.employeeName}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{req.employeeId} • {req.employeeDept}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-indigo-700 dark:text-indigo-300">{req.leaveTypeName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {formatNiceDate(req.fromDate)} – {formatNiceDate(req.endDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {req.leaveDays} {req.leaveDays === 1 ? 'day' : 'days'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            isApproved
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                              : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                          }`}
                        >
                          {isApproved ? <CheckCircle2 className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{req.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-600 dark:text-slate-400 italic font-medium">
                        "{req.reason}"
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setExpandedRequestId(isExpanded ? null : req.leaveId)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shadow-xs ${
                            isExpanded ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {isExpanded ? 'Hide' : 'Breakdown'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Breakdown Drawer */}
                    {isExpanded && (
                      <tr className="bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800/80">
                        <td colSpan={8} className="px-6 py-4 space-y-3">
                          <DayBreakdownStrip
                            dayBreakdown={req.dayBreakdown}
                            excludeFixedHolidays={policy?.excludeFixedHolidays}
                            isOptionalType={req.leaveTypeName?.toLowerCase().includes('optional')}
                          />
                          <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800/60 font-medium">
                            <span>Applied By: <strong className="text-slate-900 dark:text-slate-200">{req.appliedBy || 'HR Manager'}</strong></span>
                            <span>Applied Date: <strong className="text-slate-900 dark:text-slate-200">{new Date(req.appliedDate || req.createdAt).toLocaleString()}</strong></span>
                            {req.approvedBy && <span>Approved By: <strong className="text-emerald-700 dark:text-emerald-400">{req.approvedBy}</strong></span>}
                            {req.remarks && <span>Remarks: <strong className="text-slate-900 dark:text-slate-200">"{req.remarks}"</strong></span>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
