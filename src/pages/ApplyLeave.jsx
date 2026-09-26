import React, { useState, useEffect, useMemo } from 'react';
import {
  Send,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Info,
  CalendarDays,
  ShieldCheck,
  Check,
  Search,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';
import DayBreakdownStrip, { formatNiceDate } from '../components/DayBreakdownStrip.jsx';
import DateRangeCalendarPicker from '../components/DateRangeCalendarPicker.jsx';

export default function ApplyLeave() {
  const {
    employees,
    leaveTypes,
    policy,
    holidays,
    refreshLeaveRequests,
    refreshEmployees,
    refreshLeaveTypes,
    refreshStats,
    showToast,
    setActiveTab,
    prefilledLeave,
    setPrefilledLeave
  } = useApp();

  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [isEmpDropdownOpen, setIsEmpDropdownOpen] = useState(false);

  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('2026-08-14');
  const [endDate, setEndDate] = useState('2026-08-16');
  const [reason, setReason] = useState('');
  const [appliedBy, setAppliedBy] = useState('HR Manager (Admin)');

  // Validation Preview State
  const [preview, setPreview] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refresh employees and leave types on mount
  useEffect(() => {
    refreshEmployees();
    refreshLeaveTypes();
  }, [refreshEmployees, refreshLeaveTypes]);

  // Initialize defaults
  useEffect(() => {
    if (employees.length > 0 && !selectedEmpId) {
      const activeFirst = employees.find(e => e.status === 'Active') || employees[0];
      setSelectedEmpId(activeFirst.employeeId);
    }
  }, [employees, selectedEmpId]);

  useEffect(() => {
    if (leaveTypes.length > 0 && !selectedLeaveTypeId) {
      const planned = leaveTypes.find(lt => lt.code === 'PLANNED') || leaveTypes[0];
      setSelectedLeaveTypeId(planned.leaveTypeId);
    }
  }, [leaveTypes, selectedLeaveTypeId]);

  // Handle prefill from calendar click
  useEffect(() => {
    if (prefilledLeave) {
      if (prefilledLeave.date) {
        setFromDate(prefilledLeave.date);
        setEndDate(prefilledLeave.date);
      }
      if (prefilledLeave.leaveTypeId) {
        setSelectedLeaveTypeId(prefilledLeave.leaveTypeId);
      }
      setPrefilledLeave(null); // clear after consumption
    }
  }, [prefilledLeave, setPrefilledLeave]);

  // Active employees list filtered by search
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(empSearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(empSearch.toLowerCase())
    );
  }, [employees, empSearch]);

  const selectedEmployee = useMemo(() => {
    return employees.find(e => e.employeeId === selectedEmpId);
  }, [employees, selectedEmpId]);

  const selectedLeaveType = useMemo(() => {
    return leaveTypes.find(lt => lt.leaveTypeId === selectedLeaveTypeId);
  }, [leaveTypes, selectedLeaveTypeId]);

  // Real-time Validation Preview Trigger
  useEffect(() => {
    let isCancelled = false;

    async function runValidationPreview() {
      if (!selectedEmpId || !selectedLeaveTypeId || !fromDate || !endDate) {
        setPreview(null);
        return;
      }

      setIsValidating(true);
      try {
        const res = await api.previewValidation({
          employeeId: selectedEmpId,
          leaveTypeId: selectedLeaveTypeId,
          fromDate,
          endDate,
          reason
        });

        if (!isCancelled) {
          setPreview(res);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Validation preview error:', err);
        }
      } finally {
        if (!isCancelled) {
          setIsValidating(false);
        }
      }
    }

    const timer = setTimeout(runValidationPreview, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [selectedEmpId, selectedLeaveTypeId, fromDate, endDate, reason]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!preview?.isValid) {
      showToast('Please fix the validation errors before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createLeaveRequest({
        employeeId: selectedEmpId,
        leaveTypeId: selectedLeaveTypeId,
        fromDate,
        endDate,
        reason: reason.trim(),
        appliedBy
      });

      // Celebrate with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast(res.message || 'Leave applied successfully!', 'success');
      await Promise.all([refreshLeaveRequests(), refreshEmployees(), refreshStats()]);

      // Reset reason
      setReason('');
      setActiveTab('approvals');
    } catch (err) {
      showToast(err.message || 'Failed to submit leave application', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOptionalType = selectedLeaveType?.code === 'OPTIONAL_HOLIDAY' || selectedLeaveType?.requiresOptionalHolidayValidation;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Module 2 & 4: Application & Automated Policy Engine</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Apply Leave on Behalf of Employee</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 max-w-2xl font-medium">
            Auto-calculates leave duration, enforces holiday calendar restrictions, and excludes fixed holidays per policy.
          </p>
        </div>

        {/* Policy Indicator */}
        <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 text-xs space-y-1.5 shadow-xs">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Current Leave Rule</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">
            Fixed Holidays: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{policy?.excludeFixedHolidays ? 'Excluded (0 leave days deducted)' : 'Counted as leave'}</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">
            Approval Mode: <span className="text-indigo-700 dark:text-indigo-300 font-bold">{policy?.directApproval ? 'Direct Auto-Approval' : 'Requires Workflow Review'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container (2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
            {/* 1. Employee Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Select Employee *</span>
                {selectedEmployee && (
                  <span className={`text-[11px] font-bold ${selectedEmployee.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    Status: {selectedEmployee.status}
                  </span>
                )}
              </label>

              {/* Custom Searchable Employee Picker */}
              <div className="relative">
                <div
                  onClick={() => setIsEmpDropdownOpen(!isEmpDropdownOpen)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all shadow-xs"
                >
                  {selectedEmployee ? (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                        {selectedEmployee.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-900 dark:text-slate-200">{selectedEmployee.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {selectedEmployee.employeeId} • {selectedEmployee.department}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 font-medium">Choose an employee...</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </div>

                {isEmpDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 max-h-64 overflow-y-auto animate-scaleIn">
                    <div className="px-2 py-1.5 mb-2 sticky top-0 bg-white dark:bg-slate-900">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={empSearch}
                          onChange={(e) => setEmpSearch(e.target.value)}
                          placeholder="Search by name, ID or department..."
                          className="bg-transparent text-slate-900 dark:text-slate-200 focus:outline-none w-full font-medium"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      {filteredEmployees.map((emp) => (
                        <div
                          key={emp.employeeId}
                          onClick={() => {
                            setSelectedEmpId(emp.employeeId);
                            setIsEmpDropdownOpen(false);
                            setEmpSearch('');
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                            selectedEmpId === emp.employeeId
                              ? 'bg-indigo-50 dark:bg-indigo-600/30 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-500/40 font-bold'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center">
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-200">{emp.name}</div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{emp.employeeId} • {emp.department}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400'
                            }`}>
                              {emp.status}
                            </span>
                            {selectedEmpId === emp.employeeId && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Leave Type Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Leave Type *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {leaveTypes.map((lt) => {
                  const isSelected = selectedLeaveTypeId === lt.leaveTypeId;
                  return (
                    <div
                      key={lt.leaveTypeId}
                      onClick={() => setSelectedLeaveTypeId(lt.leaveTypeId)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-50/80 dark:bg-gradient-to-r dark:from-indigo-950/60 dark:to-violet-950/60 border-2 border-indigo-600 text-slate-900 dark:text-white shadow-sm'
                          : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-200">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: lt.color || '#6366f1' }}
                          />
                          <span>{lt.name}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-medium">
                        {lt.description}
                      </p>
                      {lt.code === 'OPTIONAL_HOLIDAY' && (
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20">
                          Requires Optional Calendar Date
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Interactive Calendar Date Selection & Instant Range Math */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Select Leave Dates (Interactive Calendar) *</span>
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Pick start & end dates on the calendar or inputs
                </span>
              </div>

              <DateRangeCalendarPicker
                fromDate={fromDate}
                endDate={endDate}
                onDateRangeChange={(start, end) => {
                  setFromDate(start);
                  setEndDate(end);
                }}
                holidays={holidays}
              />
            </div>

            {/* 4. Live Day-by-Day Itemized Breakdown */}
            {preview?.calculation?.dayBreakdown && preview.calculation.dayBreakdown.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                <DayBreakdownStrip
                  dayBreakdown={preview.calculation.dayBreakdown}
                  excludeFixedHolidays={policy?.excludeFixedHolidays}
                  isOptionalType={isOptionalType}
                />
              </div>
            )}

            {/* 5. Reason Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Reason for Leave *
                </label>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {reason.length} / {policy?.maxReasonLength || 500} chars
                </span>
              </div>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please state the business or personal reason for this leave request..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            {/* 6. HR Applicant Meta */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Applied By (HR / Manager Identifier)
              </label>
              <input
                type="text"
                value={appliedBy}
                onChange={(e) => setAppliedBy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-300 text-xs focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={isSubmitting || isValidating || (preview && !preview.isValid)}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Validating & Submitting...' : 'Submit Leave Application'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Real-time Calculation & Validation Feedback Engine (1 col) */}
        <div className="space-y-5">
          {/* Leave Days Calculation Card */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-200 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Leave Calculation Engine</span>
              </h3>
              {isValidating && (
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 animate-pulse font-bold">Computing...</span>
              )}
            </div>

            {/* Big Days Counter */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-blue-50/60 dark:from-indigo-950/60 dark:to-slate-950 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-500/20 text-center shadow-xs">
              <div className="text-xs uppercase tracking-wider text-indigo-800 dark:text-slate-400 font-bold mb-1">
                Net Leave Days Calculated
              </div>
              <div className="text-4xl font-black text-indigo-700 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-indigo-200 dark:to-indigo-400">
                {preview?.calculation?.leaveDays ?? 0}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {preview?.calculation?.leaveDays === 1 ? 'day will be recorded' : 'days will be recorded'}
              </div>
            </div>

            {/* Formula Math Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 py-1 border-b border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Gross Calendar Days:</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">
                  {preview?.calculation?.totalCalendarDays ?? 0} days
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 py-1 border-b border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Fixed Holidays Intercepted:</span>
                <span className={`font-bold ${preview?.calculation?.fixedHolidaysCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'}`}>
                  - {preview?.calculation?.fixedHolidaysCount ?? 0} days
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 py-1 border-b border-slate-200 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Optional Holidays in Span:</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">
                  {preview?.calculation?.optionalHolidaysCount ?? 0} days
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-900 dark:text-slate-200 pt-1 font-black">
                <span>Calculated Net Leave:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-sm">
                  = {preview?.calculation?.leaveDays ?? 0} days
                </span>
              </div>
            </div>
          </div>

          {/* Validation Rule Diagnostic Alert Box */}
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Holiday Calendar Validation Rules</span>
            </h4>

            {/* Real-time Status */}
            {preview?.errors && preview.errors.length > 0 ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30 text-rose-900 dark:text-rose-300 space-y-2 animate-shake">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-700 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Validation Warning ({preview.errors.length})</span>
                </div>
                <ul className="text-xs space-y-1.5 list-disc list-inside">
                  {preview.errors.map((err, i) => (
                    <li key={i} className="leading-relaxed font-semibold">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            ) : preview?.isValid ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Rules Verified & Valid</span>
                </div>
                <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-200/90 font-medium">
                  All employee, holiday calendar, and leave policy constraints are satisfied.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
                Select dates and leave type to run rule evaluations.
              </div>
            )}

            {/* Quick Helper Tips */}
            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 leading-relaxed font-medium">
              <div className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-700 dark:text-slate-300">Optional Holiday Rule:</strong> Must match a date in the 2026 Optional Holiday list (e.g. 13-Jan Lohri, 28-Aug Rakshabandhan).
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-700 dark:text-slate-300">Fixed Holiday Rule:</strong> Planned leaves across company holidays (e.g. 15 Aug Independence Day) will not deduct holiday days.
                </span>
              </div>
            </div>
          </div>

          {/* Employee Leave Quota Card */}
          {selectedEmployee && (
            <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{selectedEmployee.name}'s Quota Balance</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-slate-950/80 border border-indigo-200/80 dark:border-slate-800">
                  <span className="text-indigo-700 dark:text-slate-400 block text-[10px] font-bold">Planned Leave</span>
                  <span className="font-extrabold text-indigo-900 dark:text-indigo-300 text-base">
                    {selectedEmployee.leaveBalance?.planned ?? 0} <span className="text-xs font-medium">days</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-slate-950/80 border border-amber-200/80 dark:border-slate-800">
                  <span className="text-amber-800 dark:text-slate-400 block text-[10px] font-bold">Optional Holiday</span>
                  <span className="font-extrabold text-amber-900 dark:text-amber-300 text-base">
                    {selectedEmployee.leaveBalance?.optional ?? 0} <span className="text-xs font-medium">days</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-rose-50/70 dark:bg-slate-950/80 border border-rose-200/80 dark:border-slate-800">
                  <span className="text-rose-700 dark:text-slate-400 block text-[10px] font-bold">Sick Leave</span>
                  <span className="font-extrabold text-rose-900 dark:text-pink-300 text-base">
                    {selectedEmployee.leaveBalance?.sick ?? 0} <span className="text-xs font-medium">days</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-slate-950/80 border border-teal-200/80 dark:border-slate-800">
                  <span className="text-teal-700 dark:text-slate-400 block text-[10px] font-bold">Casual Leave</span>
                  <span className="font-extrabold text-teal-900 dark:text-cyan-300 text-base">
                    {selectedEmployee.leaveBalance?.casual ?? 0} <span className="text-xs font-medium">days</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
