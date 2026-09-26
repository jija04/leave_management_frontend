import React, { useState } from 'react';
import { X, Tag, ShieldCheck, Palette } from 'lucide-react';
import { api } from '../api/client.js';
import { useApp } from '../context/AppContext.jsx';

export default function LeaveTypeModal({ leaveType, onClose, onSuccess }) {
  const { showToast } = useApp();
  const isEditing = Boolean(leaveType);

  const [formData, setFormData] = useState({
    name: leaveType?.name || '',
    code: leaveType?.code || '',
    description: leaveType?.description || '',
    status: leaveType?.status || 'Active',
    requiresOptionalHolidayValidation: leaveType?.requiresOptionalHolidayValidation || false,
    excludeFixedHolidays: leaveType?.excludeFixedHolidays !== false,
    maxDaysPerYear: leaveType?.maxDaysPerYear || 15,
    color: leaveType?.color || '#6366f1'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await api.updateLeaveType(leaveType._id || leaveType.leaveTypeId, formData);
        showToast(`Leave Type "${formData.name}" updated.`, 'success');
      } else {
        await api.createLeaveType(formData);
        showToast(`Leave Type "${formData.name}" created.`, 'success');
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const colors = [
    '#6366f1', // Indigo
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#8b5cf6', // Violet
    '#ef4444', // Red
    '#14b8a6'  // Teal
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-gradient-to-r dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-pink-200 dark:border-indigo-500/30 flex items-center justify-center shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {isEditing ? 'Edit Leave Type' : 'Configure Leave Type'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Define policies, validation, and annual limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Leave Type Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-bold focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Planned Leave / Sick Leave"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Code Identifier *
              </label>
              <input
                type="text"
                required
                disabled={isEditing}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-bold focus:outline-none focus:border-indigo-500 font-mono disabled:opacity-50"
                placeholder="e.g. SICK / CASUAL"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Annual Quota (Days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxDaysPerYear}
                onChange={(e) => setFormData({ ...formData, maxDaysPerYear: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-medium focus:outline-none focus:border-indigo-500"
              placeholder="Purpose and applicability..."
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Theme Tag Color</span>
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    formData.color === c ? 'border-slate-900 dark:border-white scale-110 shadow-sm' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Strict Optional Holiday Validation</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Forces selection only on configured Optional Holiday dates</span>
              </div>
              <input
                type="checkbox"
                checked={formData.requiresOptionalHolidayValidation}
                onChange={(e) => setFormData({ ...formData, requiresOptionalHolidayValidation: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 cursor-pointer">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Exclude Fixed Holidays</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Deduct company fixed holidays falling inside the leave span</span>
              </div>
              <input
                type="checkbox"
                checked={formData.excludeFixedHolidays}
                onChange={(e) => setFormData({ ...formData, excludeFixedHolidays: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
            </label>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Buttons */}
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-sm font-bold shadow-md shadow-pink-500/25 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Type' : 'Create Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
