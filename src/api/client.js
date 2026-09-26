// Determine API Base URL: directly connect to backend on port 5001 in dev, or use /api proxy
const API_BASE = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? 'http://localhost:5001/api'
  : '/api';

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.message || (data.errors && data.errors.join(', ')) || 'Request failed';
    const error = new Error(errorMsg);
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Holidays
  getHolidays: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/holidays${query ? `?${query}` : ''}`);
  },
  createHoliday: (data) => fetchApi('/holidays', { method: 'POST', body: JSON.stringify(data) }),
  updateHoliday: (id, data) => fetchApi(`/holidays/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteHoliday: (id) => fetchApi(`/holidays/${id}`, { method: 'DELETE' }),
  reset2026Holidays: () => fetchApi('/holidays/reset-2026', { method: 'POST' }),

  // Leave Types
  getLeaveTypes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/leave-types${query ? `?${query}` : ''}`);
  },
  createLeaveType: (data) => fetchApi('/leave-types', { method: 'POST', body: JSON.stringify(data) }),
  updateLeaveType: (id, data) => fetchApi(`/leave-types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLeaveType: (id) => fetchApi(`/leave-types/${id}`, { method: 'DELETE' }),

  // Employees
  getEmployees: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/employees${query ? `?${query}` : ''}`);
  },
  getEmployee: (id) => fetchApi(`/employees/${id}`),
  createEmployee: (data) => fetchApi('/employees', { method: 'POST', body: JSON.stringify(data) }),

  // Leave Requests
  previewValidation: (data) => fetchApi('/leave-requests/preview-validation', { method: 'POST', body: JSON.stringify(data) }),
  getLeaveRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/leave-requests${query ? `?${query}` : ''}`);
  },
  getLeaveRequest: (id) => fetchApi(`/leave-requests/${id}`),
  createLeaveRequest: (data) => fetchApi('/leave-requests', { method: 'POST', body: JSON.stringify(data) }),
  updateLeaveStatus: (id, data) => fetchApi(`/leave-requests/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLeaveRequest: (id) => fetchApi(`/leave-requests/${id}`, { method: 'DELETE' }),

  // Policy Settings
  getPolicy: () => fetchApi('/policy'),
  updatePolicy: (data) => fetchApi('/policy', { method: 'PUT', body: JSON.stringify(data) }),
  resetPolicy: () => fetchApi('/policy/reset', { method: 'POST' }),

  // Reports
  getDashboardStats: () => fetchApi('/reports/dashboard-stats'),
  getAnalytics: () => fetchApi('/reports/analytics')
};
