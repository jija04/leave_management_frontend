import React, { useState } from 'react';
import {
  Tag,
  Plus,
  ShieldCheck,
  Edit2,
  Trash2,
  Sparkles,
  CalendarCheck2
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import LeaveTypeModal from '../components/LeaveTypeModal.jsx';

export default function LeaveTypes() {
  const { leaveTypes, refreshLeaveTypes, showToast } = useApp();
  const [modalType, setModalType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id, name) => {
    if (['PLANNED', 'OPTIONAL_HOLIDAY'].includes(id)) {
      showToast('Core system leave types cannot be deleted.', 'error');
      return;
    }
    if (!window.confirm(`Delete leave type "${name}"?`)) return;

    try {
      await api.deleteLeaveType(id);
      showToast(`Leave type "${name}" removed.`, 'success');
      refreshLeaveTypes();
    } catch (err) {
      showToast(err.message || 'Failed to delete leave type', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
            <span>Module 1.1: Leave Categories & Quotas</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Leave Type Configuration</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
            Configure Planned Leaves, Optional Floating Holidays, Sick, Casual, and customizable rules.
          </p>
        </div>

        <button
          onClick={() => {
            setModalType(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-pink-500/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Leave Type</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {leaveTypes.map((lt) => {
          return (
            <div
              key={lt.leaveTypeId || lt._id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 shadow-sm flex flex-col justify-between space-y-4 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shadow-xs"
                      style={{ backgroundColor: lt.color || '#6366f1' }}
                    />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{lt.name}</h3>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">{lt.code}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      lt.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                        : 'bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {lt.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-3 leading-relaxed font-medium">
                  {lt.description || 'Configured employee leave type.'}
                </p>

                {/* Rules & Badges */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 py-1 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="font-medium">Annual Allocation:</span>
                    <span className="font-black text-slate-900 dark:text-white">
                      {lt.maxDaysPerYear} days / year
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 py-1 border-b border-slate-200 dark:border-slate-800/80">
                    <span className="font-medium">Optional Holiday Check:</span>
                    <span className={`font-bold ${lt.requiresOptionalHolidayValidation ? 'text-amber-800 dark:text-amber-400' : 'text-slate-400'}`}>
                      {lt.requiresOptionalHolidayValidation ? 'Strict (Calendar Only)' : 'None'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 py-1">
                    <span className="font-medium">Exclude Fixed Holidays:</span>
                    <span className={`font-bold ${lt.excludeFixedHolidays ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {lt.excludeFixedHolidays ? 'Yes (Company Policy)' : 'No (Count All)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">{lt.leaveTypeId}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setModalType(lt);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 transition-colors shadow-xs"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(lt._id || lt.leaveTypeId, lt.name)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/40 text-slate-500 hover:text-rose-700 transition-colors shadow-xs"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <LeaveTypeModal
          leaveType={modalType}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refreshLeaveTypes}
        />
      )}
    </div>
  );
}
