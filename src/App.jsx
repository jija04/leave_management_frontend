import React from 'react';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ApplyLeave from './pages/ApplyLeave.jsx';
import HolidayCalendar from './pages/HolidayCalendar.jsx';
import LeaveApprovals from './pages/LeaveApprovals.jsx';
import LeaveHistory from './pages/LeaveHistory.jsx';
import LeaveTypes from './pages/LeaveTypes.jsx';
import InteractiveCalendar from './pages/InteractiveCalendar.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import { CheckCircle2, AlertTriangle, Info, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('UI Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-slate-900 border border-rose-500/30 rounded-3xl space-y-4 max-w-lg mx-auto mt-12 shadow-2xl">
          <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
          <h3 className="font-bold text-lg text-white">Something went wrong</h3>
          <p className="text-xs text-rose-300 font-mono bg-slate-950 p-3 rounded-xl border border-rose-950/40 text-left overflow-x-auto">
            {this.state.error?.message || 'Unknown render error'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload Page</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { activeTab, toast, loading } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/90 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Header */}
      <Header />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Content View */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading Leave System...</span>
              </div>
            </div>
          ) : (
            <ErrorBoundary>
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'apply' && <ApplyLeave />}
              {activeTab === 'holidays' && <HolidayCalendar />}
              {activeTab === 'approvals' && <LeaveApprovals />}
              {activeTab === 'history' && <LeaveHistory />}
              {activeTab === 'calendar' && <InteractiveCalendar />}
              {activeTab === 'types' && <LeaveTypes />}
              {activeTab === 'reports' && <Reports />}
              {activeTab === 'settings' && <Settings />}
            </ErrorBoundary>
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-xl max-w-md ${
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/90 border-rose-300 dark:border-rose-500/40 text-rose-900 dark:text-rose-200'
                : 'bg-indigo-50 dark:bg-indigo-950/90 border-indigo-300 dark:border-indigo-500/40 text-indigo-900 dark:text-indigo-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
            <span className="text-xs font-semibold leading-relaxed">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
