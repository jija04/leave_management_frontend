import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Filter,
  Search,
  RotateCcw,
  ShieldAlert,
  Star,
  Edit2,
  Trash2,
  Calendar as CalendarIcon,
  List,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { api } from '../api/client.js';
import HolidayModal from '../components/HolidayModal.jsx';
import { formatNiceDate } from '../components/DayBreakdownStrip.jsx';

export default function HolidayCalendar() {
  const { holidays, refreshHolidays, showToast, navigateToApply } = useApp();

  const [selectedYear, setSelectedYear] = useState(2026);
  const [typeFilter, setTypeFilter] = useState('All'); // All, Fixed, Optional
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [modalHoliday, setModalHoliday] = useState(null); // null = closed, {} = add, holiday = edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Refresh on mount to ensure fresh data
  React.useEffect(() => {
    refreshHolidays();
  }, [refreshHolidays]);

  // Filtered Holidays
  const filteredHolidays = useMemo(() => {
    return holidays.filter(h => {
      const matchYear = !selectedYear || String(h.year) === String(selectedYear) || (h.date && h.date.startsWith(String(selectedYear)));
      const matchType = typeFilter === 'All' || (h.type && h.type.toLowerCase() === typeFilter.toLowerCase());
      const matchSearch = !searchTerm ||
                          (h.name && h.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (h.description && h.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (h.date && h.date.includes(searchTerm));
      return matchYear && matchType && matchSearch;
    });
  }, [holidays, selectedYear, typeFilter, searchTerm]);

  // Counts
  const fixedCount = holidays.filter(h => (h.type === 'Fixed' || h.type === 'fixed') && (!selectedYear || String(h.year) === String(selectedYear) || h.date?.startsWith(String(selectedYear)))).length;
  const optionalCount = holidays.filter(h => (h.type === 'Optional' || h.type === 'optional') && (!selectedYear || String(h.year) === String(selectedYear) || h.date?.startsWith(String(selectedYear)))).length;

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete holiday "${name}"?`)) return;
    try {
      await api.deleteHoliday(id);
      showToast(`Holiday "${name}" deleted.`, 'success');
      refreshHolidays();
    } catch (err) {
      showToast(err.message || 'Failed to delete holiday', 'error');
    }
  };

  const handleReset2026 = async () => {
    if (!window.confirm('Reset calendar to the official 25 holidays provided in your 2026 holiday schedule?')) return;
    setIsResetting(true);
    try {
      const res = await api.reset2026Holidays();
      showToast(res.message, 'success');
      await refreshHolidays();
    } catch (err) {
      showToast(err.message || 'Reset failed', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900/70 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Module 1.2: Official Holiday Calendar Management</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Company Holiday Calendar</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1 font-medium">
            Pre-loaded with all 25 company holidays for year {selectedYear} ({fixedCount} Fixed, {optionalCount} Optional).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleReset2026}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/80 text-xs font-bold transition-all shadow-xs"
            title="Reload initial 25 holidays from uploaded image"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Restore 2026 Seed</span>
          </button>

          <button
            onClick={() => {
              setModalHoliday(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Holiday</span>
          </button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search & Type Filters */}
        <div className="flex items-center flex-wrap gap-3 w-full md:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search holiday name or date..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Filter Chips */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setTypeFilter('All')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                typeFilter === 'All' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({holidays.length})
            </button>
            <button
              onClick={() => setTypeFilter('Fixed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                typeFilter === 'Fixed' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Fixed ({fixedCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter('Optional')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                typeFilter === 'Optional' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
              }`}
            >
              <Star className="w-3.5 h-3.5" />
              <span>Optional ({optionalCount})</span>
            </button>
          </div>
        </div>

        {/* Year & Layout Toggles */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none focus:border-indigo-500"
          >
            <option value={2026}>Year 2026 (Active)</option>
            <option value={2025}>Year 2025</option>
            <option value={2027}>Year 2027</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950/80 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Card Grid View"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content View: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Holiday Name</th>
                  <th className="px-6 py-4">Classification</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {filteredHolidays.map((h, index) => {
                  const isFixed = h.type === 'Fixed';
                  return (
                    <tr
                      key={h.holidayId || h._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-slate-400 font-semibold">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-slate-200">{formatNiceDate(h.date)}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{h.date}</div>
                      </td>
                      <td className="px-6 py-4 font-black text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {h.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                            isFixed
                              ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30'
                              : 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                          }`}
                        >
                          {isFixed ? <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> : <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                          <span>{h.type} Holiday</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                        {h.description || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            h.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                              : 'bg-slate-100 text-slate-600 border border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setModalHoliday(h);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-slate-900 dark:text-slate-300 transition-colors shadow-xs"
                            title="Edit Holiday"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(h._id || h.holidayId, h.name)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-900/40 text-slate-500 hover:text-rose-700 transition-colors shadow-xs"
                            title="Delete Holiday"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHolidays.map((h, index) => {
            const isFixed = h.type === 'Fixed';
            return (
              <div
                key={h.holidayId || h._id}
                className={`p-5 rounded-3xl border transition-all hover:scale-[1.01] shadow-sm hover:shadow-md ${
                  isFixed
                    ? 'bg-gradient-to-br from-rose-50/80 via-white to-rose-50/30 dark:bg-slate-900/70 border-rose-200 dark:border-rose-500/20'
                    : 'bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 dark:bg-slate-900/70 border-amber-200 dark:border-amber-500/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        isFixed
                          ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30'
                          : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30'
                      }`}
                    >
                      {isFixed ? <ShieldAlert className="w-3 h-3 text-rose-600 dark:text-rose-400" /> : <Star className="w-3 h-3 text-amber-600 dark:text-amber-400" />}
                      <span>{h.type}</span>
                    </span>
                    <h4 className="font-black text-base text-slate-900 dark:text-white mt-2">{h.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-slate-500 dark:text-slate-400 font-bold block">{h.date}</span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{formatNiceDate(h.date)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 line-clamp-2 leading-relaxed font-medium">
                  {h.description || 'Predefined corporate calendar holiday.'}
                </p>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      h.status === 'Active' ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    ● {h.status}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setModalHoliday(h);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(h._id || h.holidayId, h.name)}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/40 text-slate-500 hover:text-rose-700 border border-slate-200 dark:border-slate-700 transition-colors shadow-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <HolidayModal
          holiday={modalHoliday}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refreshHolidays}
        />
      )}
    </div>
  );
}
