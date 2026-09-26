import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X, User, Calendar, Tag, Clock } from 'lucide-react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import DayBreakdownStrip, { formatNiceDate } from './DayBreakdownStrip.jsx';

export default function ApprovalActionModal({ request, actionType, onClose, onSuccess }) {
  const { showToast, policy } = useApp();
  const [remarks, setRemarks] = useState('');
  const [approverName, setApproverName] = useState('HR Manager');
  const [submitting, setSubmitting] = useState(false);

  if (!request) return null;

  const isApprove = actionType === 'Approve';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateLeaveStatus(request._id || request.leaveId, {
        status: isApprove ? 'Approved' : 'Rejected',
        approvedBy: approverName,
        remarks: remarks.trim()
      });

      showToast(
        `Leave request ${request.leaveId} was ${isApprove ? 'approved' : 'rejected'} successfully.`,
        isApprove ? 'success' : 'info'
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          isApprove
            ? 'bg-emerald-50/80 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:to-slate-900 border-emerald-100 dark:border-slate-800'
            : 'bg-rose-50/80 dark:bg-gradient-to-r dark:from-rose-950/40 dark:to-slate-900 border-rose-100 dark:border-slate-800'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs ${
              isApprove ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
            }`}>
              {isApprove ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {isApprove ? 'Approve Leave Request' : 'Reject Leave Request'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Request Ref: {request.leaveId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Summary Card */}
          <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                  {request.employeeName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-200">{request.employeeName}</h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{request.employeeId} • {request.employeeDept}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30">
                {request.leaveTypeName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Dates Requested:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formatNiceDate(request.fromDate)} – {formatNiceDate(request.endDate)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400 block font-medium">Calculated Leave Days:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  {request.leaveDays} {request.leaveDays === 1 ? 'day' : 'days'}
                </span>
                {request.fixedHolidaysCount > 0 && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                    ({request.fixedHolidaysCount} fixed holiday excluded)
                  </span>
                )}
              </div>
            </div>

            {request.reason && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
                <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1 font-bold">Reason:</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800/50 font-medium">
                  "{request.reason}"
                </p>
              </div>
            )}
          </div>

          {/* Day Breakdown Strip */}
          {request.dayBreakdown && request.dayBreakdown.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-800/50">
              <DayBreakdownStrip
                dayBreakdown={request.dayBreakdown}
                excludeFixedHolidays={policy?.excludeFixedHolidays}
                isOptionalType={request.leaveTypeName?.toLowerCase().includes('optional')}
              />
            </div>
          )}

          {/* Approver Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Approving Authority Name
            </label>
            <input
              type="text"
              required
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. HR Director / Engineering Manager"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isApprove ? 'Approval Remarks (Optional)' : 'Reason for Rejection *'}
            </label>
            <textarea
              rows={3}
              required={!isApprove}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              placeholder={isApprove ? 'Add any notes for employee or records...' : 'Please specify reason for rejecting request...'}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-bold shadow-md transition-all ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/25'
              } disabled:opacity-50`}
            >
              {isApprove ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Approving...' : 'Confirm Approval'}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>{submitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
