import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { formatNiceDate } from '../components/DayBreakdownStrip.jsx';
import DayBreakdownStrip from '../components/DayBreakdownStrip.jsx';
import ApprovalActionModal from '../components/ApprovalActionModal.jsx';

export default function LeaveApprovals() {
  const { leaveRequests, refreshLeaveRequests, refreshStats, policy } = useApp();

  const [statusFilter, setStatusFilter] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('Approve');

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter(req => {
      const matchStatus = statusFilter === 'All' || req.status.toLowerCase() === statusFilter.toLowerCase();
      const matchSearch =
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leaveId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [leaveRequests, statusFilter, searchTerm]);

  const pendingCount = leaveRequests.filter(r => r.status === 'Pending').length;
  const approvedCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const rejectedCount = leaveRequests.filter(r => r.status === 'Rejected').length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Leave Approvals & Workflow</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
            Review, validate, approve, or reject employee leave requests with custom remarks.
          </p>
        </div>

        {/* Tab Counters */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30 text-xs font-bold shadow-xs">
            {pendingCount} Pending Action
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 text-xs font-bold shadow-xs">
            {approvedCount} Approved
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee, ID, leave type..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs w-full sm:w-auto overflow-x-auto">
          {['Pending', 'Approved', 'Rejected', 'All'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {st} {st === 'Pending' ? `(${pendingCount})` : st === 'Approved' ? `(${approvedCount})` : st === 'Rejected' ? `(${rejectedCount})` : `(${leaveRequests.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Request Cards / Queue */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3 shadow-sm">
          <CheckCircle2 className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="font-bold text-base text-slate-700 dark:text-slate-300">No requests found</h3>
          <p className="text-xs text-slate-500">
            No leave requests matched the filter "{statusFilter}".
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === 'Pending';
            const isApproved = req.status === 'Approved';
            const isRejected = req.status === 'Rejected';

            return (
              <div
                key={req._id || req.leaveId}
                className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 rounded-3xl p-6 shadow-sm space-y-4 transition-all"
              >
                {/* Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-bold text-sm flex items-center justify-center border border-indigo-200 dark:border-indigo-500/20 shadow-xs">
                      {req.employeeName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{req.employeeName}</h3>
                        <span className="text-xs font-mono text-slate-500">({req.employeeId})</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-500 font-medium">{req.employeeDept}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold">{req.leaveTypeName}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          Applied: {new Date(req.appliedDate || req.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30'
                          : isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30'
                      }`}
                    >
                      {isApproved ? <CheckCircle2 className="w-3.5 h-3.5" /> : isPending ? <Clock className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{req.status}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">{req.leaveId}</span>
                  </div>
                </div>

                {/* Calculation Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Requested Date Period:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">
                      {formatNiceDate(req.fromDate)} – {formatNiceDate(req.endDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Duration Breakdown:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {req.totalCalendarDays} calendar {req.totalCalendarDays === 1 ? 'day' : 'days'}
                      {req.fixedHolidaysCount > 0 && ` (${req.fixedHolidaysCount} fixed holiday excluded)`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-semibold">Calculated Leave Days:</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {req.leaveDays} {req.leaveDays === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                </div>

                {/* Day-by-Day Itemized Strip */}
                {req.dayBreakdown && req.dayBreakdown.length > 0 && (
                  <DayBreakdownStrip
                    dayBreakdown={req.dayBreakdown}
                    excludeFixedHolidays={policy?.excludeFixedHolidays}
                    isOptionalType={req.leaveTypeName?.toLowerCase().includes('optional')}
                  />
                )}

                {/* Reason & Remarks */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50">
                    <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">Reason:</span>
                      <p className="text-slate-700 dark:text-slate-300 italic mt-0.5 font-medium">"{req.reason}"</p>
                    </div>
                  </div>

                  {req.remarks && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/30 text-slate-600 dark:text-slate-400 text-[11px] border border-slate-200 dark:border-slate-800/40 font-medium">
                      <strong>Approver Remarks:</strong> {req.remarks} (by {req.approvedBy || 'Manager'})
                    </div>
                  )}
                </div>

                {/* Approver Actions (If Pending) */}
                {isPending && (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionType('Reject');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-600/10 dark:hover:bg-rose-600 dark:text-rose-300 dark:hover:text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Reject Request</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setActionType('Approve');
                      }}
                      className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Request</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
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
