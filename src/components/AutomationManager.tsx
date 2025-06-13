'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/apiFetch';
import Pagination from './Pagination';

interface CronJob {
  _id: string;
  title: string;
  url: string;
  enabled: boolean;
  category: 'content' | 'maintenance' | 'publishing' | 'analytics';
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'paused' | 'disabled' | 'error';
  lastExecution?: string;
  nextExecution?: string;
  schedule: {
    timezone: string;
    hours: number[];
    mdays: number[];
    minutes: number[];
    months: number[];
    wdays: number[];
  };
  metadata?: {
    description?: string;
    tags?: string[];
    automationType?: string;
  };
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
}

interface JobStatistics {
  totalJobs: number;
  activeJobs: number;
  pausedJobs: number;
  failedJobs: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  categoryCounts: { [key: string]: number };
}

interface CronExecution {
  _id: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'timeout';
  startTime: string;
  endTime?: string;
  duration?: number;
  httpStatus?: number;
  error?: {
    message: string;
    code?: string;
  };
  triggeredBy: 'schedule' | 'manual' | 'retry';
}

const AutomationManager = () => {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [statistics, setStatistics] = useState<JobStatistics | null>(null);
  const [executions, setExecutions] = useState<CronExecution[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'logs' | 'sync'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentLogPage, setCurrentLogPage] = useState(1);
  
  const LOGS_PER_PAGE = 10;
    // Sync status
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Pagination calculations for logs
  const totalLogPages = Math.ceil(executions.length / LOGS_PER_PAGE);
  const startLogIndex = (currentLogPage - 1) * LOGS_PER_PAGE;
  const endLogIndex = startLogIndex + LOGS_PER_PAGE;
  const currentExecutions = executions.slice(startLogIndex, endLogIndex);

  const handleLogPageChange = (page: number) => {
    setCurrentLogPage(page);
    // Scroll to top of the logs section smoothly
    const logsSection = document.getElementById('logs-section');
    if (logsSection) {
      logsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Reset to first page when executions change or tab changes
  useEffect(() => {
    setCurrentLogPage(1);
  }, [executions.length, activeTab, selectedJob]);// Sync jobs from cron.org
  const syncJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('Calling sync API...');
      
      // Make the raw fetch call to get more control over error handling
      const url = '/api/cron/sync';
      const token = localStorage.getItem('token');
      
      console.log('Using token:', token ? 'Present' : 'Missing');
      
      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Fetch response status:', fetchResponse.status);
      console.log('Fetch response headers:', Object.fromEntries(fetchResponse.headers.entries()));
      
      // Get raw text first
      const rawText = await fetchResponse.text();
      console.log('Raw response length:', rawText.length);
      console.log('Raw response:', rawText);
      
      if (!rawText.trim()) {
        setError('Server returned empty response');
        return;
      }
      
      let response;
      try {
        response = JSON.parse(rawText);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        setError(`Invalid server response: ${rawText.substring(0, 100)}`);
        return;
      }

      console.log('Parsed response:', response);

      if (response.success) {
        setSuccess(`Successfully synced ${response.data?.jobsSynced || 0} jobs from cron.org`);
        setLastSyncTime(new Date().toLocaleString());
        await loadJobs();
        await loadStatistics();
      } else {
        setError(response.error || 'Failed to sync jobs');
      }
    } catch (err) {
      console.error('Sync error:', err);
      if (err instanceof Error && err.message.includes('JSON')) {
        setError('Server returned invalid response. Check server logs.');
      } else {
        setError(`Error syncing jobs: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const testDebugAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('Testing debug API...');
      const response = await apiFetch('/api/debug', { withAuth: false });
      console.log('Debug API response:', response);
      
      if (response.success) {
        setSuccess(`Debug Test Complete: 
          ENV: ${response.debug.environment.nodeEnv || 'unknown'}
          DB: ${response.debug.database.status}
          CronService: ${response.debug.cronService.status}
          ${response.debug.database.error ? `DB Error: ${response.debug.database.error}` : ''}
          ${response.debug.cronService.error ? `CronService Error: ${response.debug.cronService.error}` : ''}`);
      } else {
        setError(`Debug test failed: ${response.error}`);
      }
    } catch (err) {
      console.error('Debug test error:', err);
      setError(`Debug test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogsAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      console.log('Testing logs API directly...');
      
      // Test with raw fetch to see what's happening
      const response = await fetch('/api/cron/logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Logs API response status:', response.status);
      console.log('Logs API response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Logs API response text:', responseText);
      
      if (responseText.trim() === '') {
        setError('Empty response from logs API');
        return;
      }
      
      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          setSuccess(`Logs API test successful: Found ${data.executions?.length || 0} executions`);
          setExecutions(data.executions || []);
        } else {
          setError(`Logs API error: ${data.error}`);
        }
      } catch (jsonError) {
        setError(`JSON parsing error: ${jsonError instanceof Error ? jsonError.message : 'Unknown'}`);
      }
    } catch (err) {
      console.error('Logs API test error:', err);
      setError(`Logs API test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    loadStatistics();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/cron/jobs');
      if (response.success) {
        setJobs(response.jobs || []);
      } else {
        setError(response.error || 'Failed to load jobs');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await apiFetch('/api/cron/status');
      if (response.success) {
        setStatistics(response.statistics);
      }
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };  const loadJobLogs = async (jobId?: string, retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      const url = jobId ? `/api/cron/logs?jobId=${jobId}` : '/api/cron/logs';
      console.log('🔍 Loading logs from:', url);
      
      // Call logs endpoint without authentication since it's read-only monitoring
      const response = await apiFetch(url, { withAuth: false });
      console.log('🔍 Logs response:', response);
      
      if (response.success) {
        setExecutions(response.executions || []);
        setError(null);
        console.log('✅ Loaded executions:', response.executions?.length);
      } else {
        console.error('🚨 Logs API failed:', response.error);
        setError(response.error || 'Failed to load logs');
      }
    } catch (err) {
      console.error('🚨 Logs loading error:', err);
      console.error('🚨 Error type:', typeof err);
      console.error('🚨 Error message:', err instanceof Error ? err.message : 'Unknown');
      
      // Retry up to 2 times for network errors
      if (retryCount < 2 && err instanceof Error && err.message.includes('fetch')) {
        console.log(`🔄 Retrying logs fetch... (attempt ${retryCount + 1})`);
        setTimeout(() => loadJobLogs(jobId, retryCount + 1), 1000);
        return;
      }
      
      setError(`Network error occurred${retryCount > 0 ? ' (after retries)' : ''}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Load all logs when logs tab is first opened
  useEffect(() => {
    if (activeTab === 'logs' && executions.length === 0) {
      loadJobLogs(); // Load all logs initially
    }
  }, [activeTab]);


  const formatSchedule = (schedule: CronJob['schedule']) => {
    const parts = [];
    
    // Format minutes
    if (schedule.minutes.includes(-1)) {
      parts.push('Every minute');
    } else if (schedule.minutes.length === 1) {
      parts.push(`At :${schedule.minutes[0].toString().padStart(2, '0')}`);
    } else if (schedule.minutes.length <= 3) {
      parts.push(`At :${schedule.minutes.map(m => m.toString().padStart(2, '0')).join(', :')}`);
    } else {
      parts.push(`Every ${schedule.minutes.length} times/hour`);
    }
    
    // Format hours
    if (schedule.hours.includes(-1)) {
      // Already covered by "every minute" if applicable
      if (!schedule.minutes.includes(-1)) {
        parts.push('daily');
      }
    } else if (schedule.hours.length === 1) {
      const hour = schedule.hours[0];
      const time = hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;
      parts.push(`at ${time}`);
    } else if (schedule.hours.length <= 3) {
      const times = schedule.hours.map(h => {
        return h === 0 ? '12 AM' : h <= 12 ? `${h} AM` : `${h - 12} PM`;
      });
      parts.push(`at ${times.join(', ')}`);
    } else {
      parts.push(`${schedule.hours.length} times/day`);
    }
    
    return parts.join(' ');
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-300 bg-red-500/20 border border-red-500/30';
      case 'medium': return 'text-yellow-300 bg-yellow-500/20 border border-yellow-500/30';
      case 'low': return 'text-green-300 bg-green-500/20 border border-green-500/30';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-300 bg-green-500/20 border border-green-500/30';
      case 'paused': return 'text-yellow-300 bg-yellow-500/20 border border-yellow-500/30';
      case 'disabled': return 'text-gray-300 bg-gray-500/20 border border-gray-500/30';
      case 'error': return 'text-red-300 bg-red-500/20 border border-red-500/30';
      default: return 'text-gray-300 bg-gray-500/20 border border-gray-500/30';
    }
  };
  return (
    <div className="space-y-6">      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-inkbot-500 to-inkbot-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Automation Control</h2>
              <p className="text-gray-400 text-xs sm:text-sm hidden sm:block">Manage and monitor your automated blog posting</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={syncJobs}
              disabled={loading}
              className="group relative px-3 sm:px-4 py-2 bg-gradient-to-r from-inkbot-500 to-inkbot-600 hover:from-inkbot-600 hover:to-inkbot-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg shadow-inkbot-500/20 text-sm"
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync Jobs'}</span>
                <span className="sm:hidden">{loading ? 'Sync...' : 'Sync'}</span>
              </span>
            </button>
            <button
              onClick={async () => {
                // Simple test without UI complications
                try {
                  const token = localStorage.getItem('token');
                  const response = await fetch('/api/cron/sync', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    }
                  });
                  const text = await response.text();
                  console.log('Direct test response:', text);
                  alert(`Direct test result: ${text.substring(0, 200)}`);
                } catch (e) {
                  console.error('Direct test error:', e);
                  alert(`Direct test error: ${e instanceof Error ? e.message : String(e)}`);
                }
              }}
              className="px-2 sm:px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:text-white rounded-xl transition-all duration-300 hover:bg-white/20 text-sm"
            >
              Test
            </button>
            <button
              onClick={() => { loadJobs(); loadStatistics(); }}
              disabled={loading}
              className="px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:text-white rounded-xl transition-all duration-300 hover:bg-white/20 disabled:opacity-50 text-sm"
            >
              <span className="flex items-center gap-1 sm:gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </span>
            </button>
          </div>
        </div>
      </div>{/* Alerts */}
      {error && (
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-300 px-4 py-3 rounded-xl relative">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-red-300 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 text-green-300 px-4 py-3 rounded-xl relative">
          <span className="block sm:inline">{success}</span>
          <button 
            onClick={() => setSuccess(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3 text-green-300 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
      )}      {/* Tab Navigation */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10">
        <nav className="flex justify-center border-b border-white/10">
          {['overview', 'jobs', 'logs', 'sync'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`flex-1 lg:flex-none min-w-0 py-3 sm:py-4 px-3 sm:px-6 border-b-2 font-medium text-xs sm:text-sm capitalize transition-all duration-200 ${
                activeTab === tab
                  ? 'border-inkbot-500 text-inkbot-300 bg-inkbot-600/20'
                  : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>{/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-inkbot-500 to-inkbot-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Automation Overview</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">            <div className="bg-white/5 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-300 text-sm sm:text-base">Total Jobs</h3>
                <svg className="w-5 h-5 text-inkbot-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-inkbot-400">{statistics?.totalJobs || 0}</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-300 text-sm sm:text-base">Active Jobs</h3>
                <div className={`w-3 h-3 rounded-full ${(statistics?.activeJobs || 0) > 0 ? 'bg-green-500' : 'bg-gray-500'} animate-pulse`}></div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">{statistics?.activeJobs || 0}</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-300 text-sm sm:text-base">Total Executions</h3>
                <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-accent-purple">{statistics?.totalExecutions || 0}</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-300 text-sm sm:text-base">Success Rate</h3>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-green-400">
                {(statistics?.totalExecutions && statistics.totalExecutions > 0)
                  ? Math.round((statistics.successfulExecutions / statistics.totalExecutions) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      )}      {/* Jobs Tab */}      {activeTab === 'jobs' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-inkbot-500 to-inkbot-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Cron Jobs</h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                {jobs.length} job{jobs.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </div>
          
          {jobs.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No cron jobs found</h3>
              <p className="text-gray-400 mb-4">
                Try syncing jobs first or check if there are any active jobs in your cron.org account.
              </p>
              <button
                onClick={syncJobs}
                className="group relative px-6 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-600 hover:from-inkbot-600 hover:to-inkbot-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-inkbot-500/20"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Jobs
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job._id} className="group bg-white/5 backdrop-blur-sm border-l-4 border-inkbot-500 p-6 rounded-xl shadow-sm hover:shadow-xl hover:shadow-inkbot-500/20 transition-all duration-300 hover:transform hover:scale-[1.02] border border-white/10">
                  {/* Header with title and status */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0 mb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-semibold text-white group-hover:text-inkbot-300 transition-colors mb-2">{job.title}</h4>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(job.priority)}`}>
                          {job.priority} priority
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-inkbot-500/20 text-inkbot-300 border border-inkbot-500/30">
                          {job.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Schedule */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Schedule
                    </p>
                    <p className="text-sm text-gray-400 bg-white/5 px-3 py-2 rounded-lg border border-white/10">{formatSchedule(job.schedule)}</p>
                  </div>
                  
                  {/* URL */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      Endpoint
                    </p>
                    <p className="text-xs text-gray-400 break-all font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                      {job.url}
                    </p>
                  </div>
                  
                  {/* Execution info */}
                  {(job.lastExecution || job.nextExecution) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {job.lastExecution && (
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                          <p className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Last Execution
                          </p>
                          <p className="text-sm text-gray-400">{new Date(job.lastExecution).toLocaleString()}</p>
                        </div>
                      )}
                      {job.nextExecution && (
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                          <p className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Next Execution
                          </p>
                          <p className="text-sm text-gray-400">{new Date(job.nextExecution).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Actions */}                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
                    <button
                      onClick={() => { 
                        setSelectedJob(job._id); 
                        setActiveTab('logs'); 
                        loadJobLogs(job._id);
                      }}
                      className="group relative px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:bg-white/20 text-sm"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="hidden sm:inline">View Logs</span>
                        <span className="sm:hidden">Logs</span>
                      </span>
                    </button>
                    <a
                      href="https://cron-job.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative px-4 py-2 bg-gradient-to-r from-inkbot-500 to-inkbot-600 hover:from-inkbot-600 hover:to-inkbot-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl shadow-inkbot-500/20 text-sm"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="hidden sm:inline">Manage on cron.org</span>
                        <span className="sm:hidden">Manage</span>
                      </span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl">          <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-white/10">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-accent-purple to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Execution Logs</h3>
                  {selectedJob ? (
                    <p className="text-gray-400 text-xs sm:text-sm mt-1 truncate">
                      Showing logs for: {jobs.find(j => j._id === selectedJob)?.title}
                    </p>
                  ) : (
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                      Showing all execution logs
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => { setSelectedJob(null); loadJobLogs(); }}
                  className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 hover:text-white rounded-xl transition-all duration-300 hover:bg-white/20 text-sm"
                >
                  All Logs
                </button>
                <button
                  onClick={() => selectedJob ? loadJobLogs(selectedJob) : loadJobLogs()}
                  disabled={loading}
                  className="px-3 py-2 bg-gradient-to-r from-inkbot-500 to-inkbot-600 hover:from-inkbot-600 hover:to-inkbot-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 text-sm shadow-lg shadow-inkbot-500/20"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  onClick={testLogsAPI}
                  disabled={loading}
                  className="px-3 py-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 text-green-300 hover:text-white hover:bg-green-500/30 rounded-xl transition-all duration-300 disabled:opacity-50 text-sm"
                >
                  Test
                </button>
              </div>
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className={`px-6 py-4 border-b border-white/10 ${error?.includes('✅') ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${error?.includes('✅') ? 'text-green-300' : 'text-red-300'}`}>{error}</span>
                <button 
                  onClick={() => setError(null)}
                  className={`ml-auto text-xs opacity-60 hover:opacity-100 transition-opacity ${error?.includes('✅') ? 'text-green-300' : 'text-red-300'}`}
                >
                  ✕
                </button>
              </div>
            </div>
          )}          <div className="p-4 sm:p-6" id="logs-section">
            {executions.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-lg font-medium">
                  {loading ? 'Loading execution logs...' : 'No execution logs found'}
                </p>
                {!loading && (
                  <p className="text-gray-500 text-sm mt-2">
                    Try syncing jobs first or check if there are any active jobs.
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Logs Count Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-400 mb-6">
                  <div>
                    Showing {startLogIndex + 1}-{Math.min(endLogIndex, executions.length)} of {executions.length} execution logs
                  </div>
                  {totalLogPages > 1 && (
                    <div className="text-right">
                      Page {currentLogPage} of {totalLogPages}
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Execution Time
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          HTTP Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {currentExecutions.map((execution) => (
                        <tr key={execution._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(execution.startTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                              execution.status === 'success' ? 'text-green-300 bg-green-500/20 border-green-500/30' :
                              execution.status === 'failed' ? 'text-red-300 bg-red-500/20 border-red-500/30' :
                              execution.status === 'running' ? 'text-blue-300 bg-blue-500/20 border-blue-500/30' :
                              execution.status === 'pending' ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30' :
                              'text-gray-300 bg-gray-500/20 border-gray-500/30'
                            }`}>
                              {execution.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {execution.duration ? `${(execution.duration / 1000).toFixed(2)}s` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {execution.httpStatus ? (
                              <span className={`font-medium ${
                                execution.httpStatus >= 200 && execution.httpStatus < 300 
                                  ? 'text-green-400' 
                                  : 'text-red-400'
                              }`}>
                                {execution.httpStatus}
                              </span>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400 max-w-xs truncate">
                            {execution.error ? execution.error.message : 'Success'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {currentExecutions.map((execution) => (
                    <div key={execution._id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-300 mb-1">
                            {new Date(execution.startTime).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(execution.startTime).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ml-3 ${
                          execution.status === 'success' ? 'text-green-300 bg-green-500/20 border-green-500/30' :
                          execution.status === 'failed' ? 'text-red-300 bg-red-500/20 border-red-500/30' :
                          execution.status === 'running' ? 'text-blue-300 bg-blue-500/20 border-blue-500/30' :
                          execution.status === 'pending' ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30' :
                          'text-gray-300 bg-gray-500/20 border-gray-500/30'
                        }`}>
                          {execution.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-gray-300 ml-1">
                            {execution.duration ? `${(execution.duration / 1000).toFixed(2)}s` : '-'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">HTTP Status:</span>
                          {execution.httpStatus ? (
                            <span className={`ml-1 font-medium ${
                              execution.httpStatus >= 200 && execution.httpStatus < 300 
                                ? 'text-green-400' 
                                : 'text-red-400'
                            }`}>
                              {execution.httpStatus}
                            </span>
                          ) : (
                            <span className="text-gray-500 ml-1">-</span>
                          )}
                        </div>
                      </div>
                      
                      {(execution.error || execution.status === 'success') && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className="text-gray-400 text-xs">Details:</span>
                          <p className="text-gray-300 text-xs mt-1 break-words">
                            {execution.error ? execution.error.message : 'Execution completed successfully'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalLogPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentLogPage}
                      totalPages={totalLogPages}
                      onPageChange={handleLogPageChange}
                      className="w-full max-w-md"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}      {/* Sync Tab */}
      {activeTab === 'sync' && (        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl p-4 sm:p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Job Synchronization</h3>
          </div>
            <div className="space-y-6 sm:space-y-8">
            <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-blue-300 mb-2">Read-Only Mode</h4>
                  <p className="text-blue-200 leading-relaxed text-sm sm:text-base">
                    This system monitors existing cron jobs from your cron.org account. 
                    To create new jobs, please use the{' '}
                    <a 
                      href="https://cron-job.org" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline font-medium text-blue-100 hover:text-white transition-colors"
                    >
                      cron-job.org dashboard
                    </a>{' '}
                    directly.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-inkbot-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="font-semibold text-white text-sm sm:text-base">Last Sync</h4>
                </div>
                <p className="text-gray-300 text-base sm:text-lg">
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}
                </p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <h4 className="font-semibold text-white text-sm sm:text-base">Sync Status</h4>
                </div>
                <p className="text-gray-300 text-base sm:text-lg">
                  {loading ? 'Syncing...' : 'Ready'}
                </p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Sync Operations
              </h4>
              <div className="space-y-4">                <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                  <button
                    onClick={async () => {
                      await syncJobs();
                      setLastSyncTime(new Date().toISOString());
                    }}
                    disabled={loading}
                    className="group relative px-4 sm:px-6 py-3 bg-gradient-to-r from-inkbot-500 to-inkbot-600 hover:from-inkbot-600 hover:to-inkbot-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-lg shadow-inkbot-500/20 text-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="hidden sm:inline">{loading ? 'Syncing from cron.org...' : 'Sync Jobs from cron.org'}</span>
                      <span className="sm:hidden">{loading ? 'Syncing...' : 'Sync Jobs'}</span>
                    </span>
                  </button>
                  
                  <button
                    onClick={testDebugAPI}
                    disabled={loading}
                    className="px-4 sm:px-6 py-3 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 text-purple-300 hover:text-white hover:bg-purple-500/30 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 text-sm"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline">Debug Environment</span>
                      <span className="sm:hidden">Debug</span>
                    </span>
                  </button>
                </div>
                  <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                  This will fetch all jobs from your cron.org account and update the local database for monitoring.
                </p>
              </div>
            </div>            <div className="border-t border-white/10 pt-6 sm:pt-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10">
                <h4 className="font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Jobs
                </h4>
                <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  To create new automation jobs, please visit the cron.org dashboard:
                </p>
                <a
                  href="https://cron-job.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center px-4 sm:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/20 text-sm"
                >
                  <svg className="w-4 sm:w-5 h-4 sm:h-5 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3M10 6l6-6M10 6L8 8m8-2v8" />
                  </svg>
                  <span className="hidden sm:inline">Open cron.org Dashboard</span>
                  <span className="sm:hidden">Open Dashboard</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationManager;
