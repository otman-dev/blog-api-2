import { ICronJob } from '../models/CronJob';
import { ICronExecution } from '../models/CronExecution';
import connectToCronDB from './db/cronDb';
import mongoose from 'mongoose';

export interface CronJobCreateData {
  title: string;
  url: string;
  enabled?: boolean;
  saveResponses?: boolean;
  schedule: {
    timezone?: string;
    expiresAt?: number;
    hours?: number[];
    mdays?: number[];
    minutes?: number[];
    months?: number[];
    wdays?: number[];
  };
  requestTimeout?: number;
  redirectSuccess?: boolean;
  requestMethod?: number;
  auth?: {
    enable: boolean;
    user?: string;
    password?: string;
  };
  notification?: {
    onFailure?: boolean;
    onSuccess?: boolean;
    onDisable?: boolean;
  };
  extendedData?: {
    headers?: { [key: string]: string };
    body?: string;
  };
  category: 'content' | 'maintenance' | 'publishing' | 'analytics';
  priority?: 'low' | 'medium' | 'high';
  maxRetries?: number;
  createdBy: string;
  metadata?: {
    description?: string;
    tags?: string[];
    automationType?: string;
  };
}

export interface CronOrgResponse {
  success: boolean;
  error?: {
    message: string;
    code?: number;
  };
  data?: any;
}

export class CronService {
  private apiKey: string;
  private baseUrl = 'https://api.cron-job.org';  private cronJobModel!: mongoose.Model<ICronJob>;
  private cronExecutionModel!: mongoose.Model<ICronExecution>;

  constructor() {
    this.apiKey = process.env.CRON_ORG_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('CRON_ORG_API_KEY is required');
    }
  }

  private async initializeModels() {
    const connection = await connectToCronDB();
    
    if (!this.cronJobModel) {
      const CronJobSchema = new mongoose.Schema({
        title: { type: String, required: true },
        url: { type: String, required: true },
        enabled: { type: Boolean, default: true },
        saveResponses: { type: Boolean, default: false },
        schedule: {
          timezone: { type: String, default: 'UTC' },
          expiresAt: { type: Number },
          hours: [{ type: Number }],
          mdays: [{ type: Number }],
          minutes: [{ type: Number }],
          months: [{ type: Number }],
          wdays: [{ type: Number }]
        },
        requestTimeout: { type: Number, default: 30 },
        redirectSuccess: { type: Boolean, default: true },
        requestMethod: { type: Number, default: 1 },
        auth: {
          enable: { type: Boolean, default: false },
          user: String,
          password: String
        },
        notification: {
          onFailure: { type: Boolean, default: true },
          onSuccess: { type: Boolean, default: false },
          onDisable: { type: Boolean, default: false }
        },
        extendedData: {
          headers: { type: Map, of: String },
          body: String
        },
        cronJobId: Number,
        category: { 
          type: String, 
          enum: ['content', 'maintenance', 'publishing', 'analytics'],
          required: true 
        },
        priority: { 
          type: String, 
          enum: ['low', 'medium', 'high'],
          default: 'medium' 
        },
        retryCount: { type: Number, default: 0 },
        maxRetries: { type: Number, default: 3 },
        lastExecution: Date,
        nextExecution: Date,
        status: { 
          type: String, 
          enum: ['active', 'paused', 'disabled', 'error'],
          default: 'active' 
        },
        createdBy: { type: String, required: true },
        metadata: {
          description: String,
          tags: [String],
          automationType: String
        }
      }, { timestamps: true });

      this.cronJobModel = connection.models.CronJob || connection.model<ICronJob>('CronJob', CronJobSchema);
    }

    if (!this.cronExecutionModel) {
      const CronExecutionSchema = new mongoose.Schema({
        cronJobId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'CronJob', 
          required: true 
        },
        cronOrgJobId: Number,
        executionId: String,
        status: { 
          type: String, 
          enum: ['pending', 'running', 'success', 'failed', 'timeout'],
          default: 'pending'
        },
        startTime: { type: Date, required: true },
        endTime: Date,
        duration: Number,
        httpStatus: Number,
        response: {
          body: String,
          headers: { type: Map, of: String },
          size: Number
        },
        error: {
          message: String,
          code: String,
          stack: String
        },
        retryAttempt: { type: Number, default: 0 },
        triggeredBy: { 
          type: String, 
          enum: ['schedule', 'manual', 'retry'],
          required: true 
        },
        metadata: {
          userAgent: String,
          ip: String,
          executedBy: String
        }
      }, { timestamps: true });

      this.cronExecutionModel = connection.models.CronExecution || connection.model<ICronExecution>('CronExecution', CronExecutionSchema);
    }
  }

  private async apiRequest(endpoint: string, method: string = 'GET', data?: any): Promise<CronOrgResponse> {
    try {
      const headers: HeadersInit = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      };

      const config: RequestInit = {
        method,
        headers,
      };

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, config);
      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: responseData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
            code: response.status
          }
        };
      }

      return {
        success: true,
        data: responseData
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          code: 0
        }
      };
    }
  }  // Sync jobs from cron.org to our database for monitoring
  async syncJobs(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      await this.initializeModels();
      
      const response = await this.apiRequest('/jobs', 'GET');

      if (!response.success) {
        return {
          success: false,
          error: response.error?.message || 'Failed to fetch jobs from cron.org'
        };
      }

      const jobs = response.data?.jobs || [];
      let totalExecutionsSynced = 0;
      
      // Sync each job to our database
      for (const cronOrgJob of jobs) {
        const syncedJob = await this.cronJobModel.findOneAndUpdate(
          { cronJobId: cronOrgJob.jobId },
          {
            cronJobId: cronOrgJob.jobId,
            title: cronOrgJob.title,
            url: cronOrgJob.url,
            enabled: cronOrgJob.enabled,
            saveResponses: cronOrgJob.saveResponses,
            schedule: cronOrgJob.schedule,
            requestTimeout: cronOrgJob.requestTimeout,
            redirectSuccess: cronOrgJob.redirectSuccess,
            requestMethod: cronOrgJob.requestMethod,
            auth: cronOrgJob.auth,
            notification: cronOrgJob.notification,
            extendedData: cronOrgJob.extendedData,
            category: this.inferCategory(cronOrgJob.title, cronOrgJob.url),
            priority: this.inferPriority(cronOrgJob.title),
            status: cronOrgJob.enabled ? 'active' : 'paused',
            lastExecution: cronOrgJob.lastExecution ? new Date(cronOrgJob.lastExecution * 1000) : undefined,
            nextExecution: cronOrgJob.nextExecution ? new Date(cronOrgJob.nextExecution * 1000) : undefined,
            updatedAt: new Date(),
            metadata: {
              description: `Synced from cron.org - ${cronOrgJob.title}`,
              tags: ['synced', 'cron-org'],
              source: 'cron.org',
              lastStatus: cronOrgJob.lastStatus,
              lastDuration: cronOrgJob.lastDuration
            }
          },
          { upsert: true, new: true }
        );

        // Sync execution history for this job
        try {
          const historyResponse = await this.apiRequest(`/jobs/${cronOrgJob.jobId}/history`, 'GET');
          
          if (historyResponse.success && historyResponse.data?.history) {
            const executions = historyResponse.data.history;
            
            for (const execution of executions) {
              // Check if this execution already exists to avoid duplicates
              const existingExecution = await this.cronExecutionModel.findOne({
                cronOrgJobId: cronOrgJob.jobId,
                executionId: execution.identifier
              });

              if (!existingExecution) {
                await this.cronExecutionModel.create({
                  cronJobId: syncedJob!._id,
                  cronOrgJobId: cronOrgJob.jobId,
                  executionId: execution.identifier,
                  status: this.mapCronOrgStatus(execution.status),
                  startTime: new Date(execution.date * 1000),
                  endTime: new Date(execution.date * 1000 + execution.duration),
                  duration: execution.duration,
                  httpStatus: execution.httpStatus,
                  response: {
                    body: execution.body || '',
                    headers: new Map(),
                    size: 0
                  },
                  error: execution.status !== 1 ? {
                    message: execution.statusText || 'Unknown error',
                    code: execution.status?.toString()
                  } : undefined,
                  retryAttempt: 0,
                  triggeredBy: 'schedule',
                  metadata: {
                    userAgent: 'cron.org',
                    executedBy: 'cron.org',
                    jitter: execution.jitter,
                    stats: execution.stats
                  }
                });
                totalExecutionsSynced++;
              }
            }
          }
        } catch (historyError) {
          console.warn(`Failed to sync history for job ${cronOrgJob.jobId}:`, historyError);
        }
      }

      return {
        success: true,
        data: {
          jobsSynced: jobs.length,
          executionsSynced: totalExecutionsSynced,
          jobs: jobs
        }
      };
    } catch (error) {
      console.error('Error syncing jobs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Helper method to map cron.org execution status to our status
  private mapCronOrgStatus(cronOrgStatus: number): 'pending' | 'running' | 'success' | 'failed' | 'timeout' {
    switch (cronOrgStatus) {
      case 1:
        return 'success';
      case 0:
        return 'failed';
      case -1:
        return 'timeout';
      default:
        return 'failed';
    }
  }

  // Helper methods to infer job properties
  private inferCategory(title: string, url: string): 'content' | 'maintenance' | 'publishing' | 'analytics' {
    const titleLower = title.toLowerCase();
    const urlLower = url.toLowerCase();
    
    if (titleLower.includes('content') || titleLower.includes('blog') || titleLower.includes('generate')) {
      return 'content';
    }
    if (titleLower.includes('maintenance') || titleLower.includes('cleanup') || titleLower.includes('backup')) {
      return 'maintenance';
    }
    if (titleLower.includes('publish') || titleLower.includes('deploy')) {
      return 'publishing';
    }
    if (titleLower.includes('analytics') || titleLower.includes('stats') || titleLower.includes('report')) {
      return 'analytics';
    }
    
    // Check URL patterns
    if (urlLower.includes('generate') || urlLower.includes('content')) {
      return 'content';
    }
    
    return 'content'; // Default
  }

  private inferPriority(title: string): 'low' | 'medium' | 'high' {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('critical') || titleLower.includes('urgent') || titleLower.includes('important')) {
      return 'high';
    }
    if (titleLower.includes('backup') || titleLower.includes('maintenance')) {
      return 'medium';
    }
    
    return 'medium'; // Default
  }  async createJob(jobData: CronJobCreateData): Promise<{ success: boolean; job?: ICronJob; error?: string }> {
    // Job creation is disabled - only sync existing jobs from cron.org
    return {
      success: false,
      error: 'Job creation is disabled. This system only monitors existing cron.org jobs. Please create jobs directly in cron.org dashboard.'
    };
  }

  async getJobs(filters?: { 
    category?: string; 
    status?: string; 
    createdBy?: string; 
  }): Promise<{ success: boolean; jobs?: ICronJob[]; error?: string }> {
    try {
      await this.initializeModels();

      const query: any = {};
      if (filters?.category) query.category = filters.category;
      if (filters?.status) query.status = filters.status;
      if (filters?.createdBy) query.createdBy = filters.createdBy;

      const jobs = await this.cronJobModel.find(query).sort({ createdAt: -1 });

      return {
        success: true,
        jobs
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs'
      };
    }
  }

  async getJobById(id: string): Promise<{ success: boolean; job?: ICronJob; error?: string }> {
    try {
      await this.initializeModels();

      const job = await this.cronJobModel.findById(id);
      
      if (!job) {
        return {
          success: false,
          error: 'Job not found'
        };
      }

      return {
        success: true,
        job
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job'
      };
    }
  }

  async updateJob(id: string, updates: Partial<CronJobCreateData>): Promise<{ success: boolean; job?: ICronJob; error?: string }> {
    try {
      await this.initializeModels();

      const existingJob = await this.cronJobModel.findById(id);
      if (!existingJob) {
        return {
          success: false,
          error: 'Job not found'
        };
      }

      // Update job in cron-job.org if it has a cronJobId
      if (existingJob.cronJobId && updates) {
        const cronOrgData = {
          job: {
            title: updates.title || existingJob.title,
            url: updates.url || existingJob.url,
            enabled: updates.enabled ?? existingJob.enabled,
            saveResponses: updates.saveResponses ?? existingJob.saveResponses,
            schedule: updates.schedule || existingJob.schedule,
            requestTimeout: updates.requestTimeout || existingJob.requestTimeout,
            redirectSuccess: updates.redirectSuccess ?? existingJob.redirectSuccess,
            requestMethod: updates.requestMethod || existingJob.requestMethod,
            auth: updates.auth || existingJob.auth,
            notification: updates.notification || existingJob.notification,
            extendedData: updates.extendedData || existingJob.extendedData
          }
        };

        const response = await this.apiRequest(`/jobs/${existingJob.cronJobId}`, 'PATCH', cronOrgData);
        
        if (!response.success) {
          return {
            success: false,
            error: response.error?.message || 'Failed to update job in cron-job.org'
          };
        }
      }

      // Update job in our database
      const updatedJob = await this.cronJobModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true }
      );

      return {
        success: true,
        job: updatedJob!
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update job'
      };
    }
  }

  async deleteJob(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.initializeModels();

      const job = await this.cronJobModel.findById(id);
      if (!job) {
        return {
          success: false,
          error: 'Job not found'
        };
      }

      // Delete job from cron-job.org
      if (job.cronJobId) {
        const response = await this.apiRequest(`/jobs/${job.cronJobId}`, 'DELETE');
        
        if (!response.success) {
          console.warn(`Failed to delete job from cron-job.org: ${response.error?.message}`);
        }
      }

      // Delete job from our database
      await this.cronJobModel.findByIdAndDelete(id);

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete job'
      };
    }
  }

  async executeJob(id: string, triggeredBy: string = 'manual'): Promise<{ success: boolean; execution?: ICronExecution; error?: string }> {
    try {
      await this.initializeModels();

      const job = await this.cronJobModel.findById(id);
      if (!job) {
        return {
          success: false,
          error: 'Job not found'
        };
      }

      if (!job.cronJobId) {
        return {
          success: false,
          error: 'Job does not have a cron-job.org ID'
        };
      }

      // Create execution record
      const execution = new this.cronExecutionModel({
        cronJobId: job._id,
        cronOrgJobId: job.cronJobId,
        status: 'pending',
        startTime: new Date(),
        triggeredBy: triggeredBy as any,
        metadata: {
          executedBy: triggeredBy
        }
      });

      await execution.save();

      // Execute job via cron-job.org
      const response = await this.apiRequest(`/jobs/${job.cronJobId}/run`, 'PATCH');

      if (!response.success) {
        execution.status = 'failed';
        execution.endTime = new Date();
        execution.error = {
          message: response.error?.message || 'Failed to execute job',
          code: response.error?.code?.toString()
        };
        await execution.save();

        return {
          success: false,
          error: response.error?.message || 'Failed to execute job'
        };
      }

      execution.status = 'running';
      await execution.save();

      // Update job's last execution time
      job.lastExecution = new Date();
      await job.save();

      return {
        success: true,
        execution
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute job'
      };
    }
  }

  async getJobHistory(jobId: string, limit: number = 50): Promise<{ success: boolean; executions?: ICronExecution[]; error?: string }> {
    try {
      await this.initializeModels();

      const executions = await this.cronExecutionModel
        .find({ cronJobId: jobId })
        .sort({ startTime: -1 })
        .limit(limit);

      return {
        success: true,
        executions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job history'
      };
    }
  }

  async getAllExecutions(limit: number = 50): Promise<{ success: boolean; executions?: ICronExecution[]; error?: string }> {
    try {
      await this.initializeModels();

      const executions = await this.cronExecutionModel
        .find({})
        .sort({ startTime: -1 })
        .limit(limit);

      return {
        success: true,
        executions
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch executions'
      };
    }
  }

  async getJobStatistics(): Promise<{ 
    success: boolean; 
    stats?: {
      totalJobs: number;
      activeJobs: number;
      pausedJobs: number;
      failedJobs: number;
      totalExecutions: number;
      successfulExecutions: number;
      failedExecutions: number;
      categoryCounts: { [key: string]: number };
    }; 
    error?: string;
  }> {
    try {
      await this.initializeModels();

      const [
        totalJobs,
        activeJobs,
        pausedJobs,
        failedJobs,
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        categoryStats
      ] = await Promise.all([
        this.cronJobModel.countDocuments(),
        this.cronJobModel.countDocuments({ status: 'active' }),
        this.cronJobModel.countDocuments({ status: 'paused' }),
        this.cronJobModel.countDocuments({ status: 'error' }),
        this.cronExecutionModel.countDocuments(),
        this.cronExecutionModel.countDocuments({ status: 'success' }),
        this.cronExecutionModel.countDocuments({ status: 'failed' }),
        this.cronJobModel.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ])
      ]);

      const categoryCounts: { [key: string]: number } = {};
      categoryStats.forEach((stat: any) => {
        categoryCounts[stat._id] = stat.count;
      });

      return {
        success: true,
        stats: {
          totalJobs,
          activeJobs,
          pausedJobs,
          failedJobs,
          totalExecutions,
          successfulExecutions,
          failedExecutions,
          categoryCounts
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics'
      };
    }
  }
}

export const cronService = new CronService();
