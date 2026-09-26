import React, { useState, useEffect } from 'react';
import {
  Sliders,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';

export default function Settings() {
  const { policy, refreshPolicy, showToast } = useApp();

  const [formData, setFormData] = useState({
    excludeFixedHolidays: true,
    directApproval: false,
    minReasonLength: 3,
    maxReasonLength: 500,
    maxOptionalHolidaysPerYear: 3
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (policy) {
      setFormData({
        excludeFixedHolidays: policy.excludeFixedHolidays !== false,
        directApproval: Boolean(policy.directApproval),
        minReasonLength: policy.minReasonLength ?? 3,
        maxReasonLength: policy.maxReasonLength ?? 500,
        maxOptionalHolidaysPerYear: policy.maxOptionalHolidaysPerYear ?? 3
      });
    }
  }, [policy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updatePolicy(formData);
      showToast('Leave policy settings saved successfully.', 'success');
      await refreshPolicy();
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset policy configuration to default values?')) return;
    try {
      await api.resetPolicy();
      showToast('Policy restored to defaults.', 'info');
      await refreshPolicy();
    } catch (err) {
      showToast(err.message || 'Failed to reset settings', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Leave Policy & Engine Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
            Configure holiday deduction rules, approval workflows, and text constraints.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold self-start sm:self-auto transition-all shadow-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Holiday Calculation Policy */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-extrabold text-base pb-3 border-b border-slate-200 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Holiday Calculation Policy (Section 4.1)</span>
          </div>

          <label className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 cursor-pointer hover:border-indigo-400 transition-all">
            <div className="space-y-1">
              <span className="font-extrabold text-sm text-slate-900 dark:text-slate-200 block">
                Exclude Fixed Holidays from Leave Duration
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
                When enabled, if an employee applies for Planned Leave across a period containing a predefined Fixed Holiday (e.g. 14 Aug to 16 Aug, with 15 Aug Independence Day), that day is not counted as a leave day.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.excludeFixedHolidays}
              onChange={(e) => setFormData({ ...formData, excludeFixedHolidays: e.target.checked })}
              className="mt-1 w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300 dark:bg-slate-900 dark:border-slate-700 cursor-pointer"
            />
          </label>
        </div>

        {/* Section 2: Approval Workflow Option */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-extrabold text-base pb-3 border-b border-slate-200 dark:border-slate-800">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Leave Submission Workflow (Section 10)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                !formData.directApproval
                  ? 'bg-indigo-50/90 border-2 border-indigo-600 text-slate-900 shadow-sm'
                  : 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <input
                type="radio"
                name="directApproval"
                checked={!formData.directApproval}
                onChange={() => setFormData({ ...formData, directApproval: false })}
                className="sr-only"
              />
              <div className="font-extrabold text-sm text-indigo-800 dark:text-indigo-300">Option B – Approval Workflow</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                Applied leaves start in <strong>Pending</strong> state and require explicit manager review & remarks before being marked Approved or Rejected.
              </p>
            </label>

            <label
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                formData.directApproval
                  ? 'bg-emerald-50/90 border-2 border-emerald-600 text-slate-900 shadow-sm'
                  : 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <input
                type="radio"
                name="directApproval"
                checked={formData.directApproval}
                onChange={() => setFormData({ ...formData, directApproval: true })}
                className="sr-only"
              />
              <div className="font-extrabold text-sm text-emerald-800 dark:text-emerald-300">Option A – Direct Approval</div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed font-medium">
                HR/Manager applied leaves are automatically marked <strong>Approved</strong> immediately upon submission without pending queue.
              </p>
            </label>
          </div>
        </div>

        {/* Section 3: Reason Constraints & Annual Floating Quota */}
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-200 dark:border-slate-800">
            Form Field Validation Limits
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Minimum Reason Length
              </label>
              <input
                type="number"
                min="1"
                value={formData.minReasonLength}
                onChange={(e) => setFormData({ ...formData, minReasonLength: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum Reason Length
              </label>
              <input
                type="number"
                min="50"
                value={formData.maxReasonLength}
                onChange={(e) => setFormData({ ...formData, maxReasonLength: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Annual Optional Limit
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxOptionalHolidaysPerYear}
                onChange={(e) => setFormData({ ...formData, maxOptionalHolidaysPerYear: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Saving Policy...' : 'Save Policy Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
