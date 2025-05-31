'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/apiFetch';

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
  // Sync status
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Sync jobs from cron.org
  const syncJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFetch('/api/cron/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.success) {
        setSuccess(`Successfully synced ${response.data?.synced || 0} jobs from cron.org`);
        await loadJobs();
      } else {
        setError(response.error || 'Failed to sync jobs');
      }
    } catch (err) {
      setError('Error syncing jobs from cron.org');
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
  };
  const loadJobLogs = async (jobId?: string) => {
    try {
      setLoading(true);
      const url = jobId ? `/api/cron/logs?jobId=${jobId}` : '/api/cron/logs';
      const response = await apiFetch(url);
      if (response.success) {
        setExecutions(response.executions || []);
      } else {
        setError(response.error || 'Failed to load logs');
      }
    } catch (err) {
      setError('Network error occurred');
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
    
    if (schedule.minutes.includes(-1)) parts.push('Every minute');
    else parts.push(`Minutes: ${schedule.minutes.join(', ')}`);
    
    if (schedule.hours.includes(-1)) parts.push('Every hour');
    else parts.push(`Hours: ${schedule.hours.join(', ')}`);
    
    if (schedule.mdays.includes(-1)) parts.push('Every day');
    else parts.push(`Days: ${schedule.mdays.join(', ')}`);
    
    return parts.join(' | ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'disabled': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Automation Control</h2>
        <div className="flex space-x-2">
          <button
            onClick={syncJobs}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync Jobs'}
          </button>
          <button
            onClick={() => { loadJobs(); loadStatistics(); }}
            disabled={loading}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ✕
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{success}</span>
          <button 
            onClick={() => setSuccess(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'jobs', 'logs', 'sync'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Jobs</h3>
            <p className="text-3xl font-bold text-blue-600">{statistics?.totalJobs || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Active Jobs</h3>
            <p className="text-3xl font-bold text-green-600">{statistics?.activeJobs || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Executions</h3>
            <p className="text-3xl font-bold text-purple-600">{statistics?.totalExecutions || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {statistics?.totalExecutions 
                ? Math.round((statistics.successfulExecutions / statistics.totalExecutions) * 100)
                : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Cron Jobs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">{job.url}</div>
                        <div className="flex space-x-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(job.priority)}`}>
                            {job.priority}
                          </span>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            {job.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSchedule(job.schedule)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => { 
                          setSelectedJob(job._id); 
                          setActiveTab('logs'); 
                          loadJobLogs(job._id);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Logs
                      </button>
                      <a
                        href="https://cron.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Manage
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Execution Logs</h3>
                {selectedJob ? (
                  <p className="text-sm text-gray-500 mt-1">
                    Showing logs for: {jobs.find(j => j._id === selectedJob)?.title}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">
                    Showing all execution logs
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => { setSelectedJob(null); loadJobLogs(); }}
                  className="bg-gray-500 text-white px-3 py-1 text-sm rounded hover:bg-gray-600"
                >
                  All Logs
                </button>
                <button
                  onClick={() => selectedJob ? loadJobLogs(selectedJob) : loadJobLogs()}
                  disabled={loading}
                  className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {executions.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">
                  {loading ? 'Loading execution logs...' : 'No execution logs found.'}
                </p>
                {!loading && (
                  <p className="text-sm text-gray-400 mt-2">
                    Try syncing jobs first or check if there are any active jobs.
                  </p>
                )}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Execution Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HTTP Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {executions.map((execution) => (
                    <tr key={execution._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(execution.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          execution.status === 'success' ? 'text-green-600 bg-green-100' :
                          execution.status === 'failed' ? 'text-red-600 bg-red-100' :
                          execution.status === 'running' ? 'text-blue-600 bg-blue-100' :
                          execution.status === 'pending' ? 'text-yellow-600 bg-yellow-100' :
                          'text-gray-600 bg-gray-100'
                        }`}>
                          {execution.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {execution.duration ? `${(execution.duration / 1000).toFixed(2)}s` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {execution.httpStatus ? (
                          <span className={`${
                            execution.httpStatus >= 200 && execution.httpStatus < 300 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {execution.httpStatus}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {execution.error ? execution.error.message : 'Success'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}{/* Sync Tab */}
      {activeTab === 'sync' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Job Synchronization</h3>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-blue-800">Read-Only Mode</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This system monitors existing cron jobs from your cron.org account. 
                    To create new jobs, please use the <a href="https://cron.org" target="_blank" rel="noopener noreferrer" className="underline font-medium">cron.org dashboard</a> directly.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Last Sync</h4>
                <p className="text-sm text-gray-600">
                  {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Sync Status</h4>
                <p className="text-sm text-gray-600">
                  {loading ? 'Syncing...' : 'Ready'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Sync Operations</h4>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    await syncJobs();
                    setLastSyncTime(new Date().toISOString());
                  }}
                  disabled={loading}
                  className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Syncing from cron.org...' : 'Sync Jobs from cron.org'}
                </button>
                
                <p className="text-sm text-gray-600">
                  This will fetch all jobs from your cron.org account and update the local database for monitoring.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-gray-900 mb-3">Create New Jobs</h4>
              <p className="text-sm text-gray-600 mb-3">
                To create new automation jobs, please visit the cron.org dashboard:
              </p>
              <a
                href="https://cron.org"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-3M10 6l6-6M10 6L8 8m8-2v8" />
                </svg>
                Open cron.org Dashboard
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomationManager;
