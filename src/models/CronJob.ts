import mongoose, { Schema, Document } from 'mongoose';

export interface ICronJob extends Document {
  title: string;
  url: string;
  enabled: boolean;
  saveResponses: boolean;
  schedule: {
    timezone: string;
    expiresAt?: number;
    hours: number[];
    mdays: number[];
    minutes: number[];
    months: number[];
    wdays: number[];
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
    onFailure: boolean;
    onSuccess: boolean;
    onDisable: boolean;
  };
  extendedData?: {
    headers?: { [key: string]: string };
    body?: string;
  };
  
  // Internal tracking fields
  cronJobId?: number; // ID from cron-job.org
  category: 'content' | 'maintenance' | 'publishing' | 'analytics';
  priority: 'low' | 'medium' | 'high';
  retryCount: number;
  maxRetries: number;
  lastExecution?: Date;
  nextExecution?: Date;
  status: 'active' | 'paused' | 'disabled' | 'error';
  createdBy: string;
  metadata?: {
    description?: string;
    tags?: string[];
    automationType?: string;
  };
}

const CronJobSchema: Schema = new Schema({
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
  requestMethod: { type: Number, default: 1 }, // 1 = GET, 2 = POST
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
  
  // Internal tracking fields
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
}, {
  timestamps: true
});

// Index for efficient queries
CronJobSchema.index({ status: 1, category: 1 });
CronJobSchema.index({ cronJobId: 1 });
CronJobSchema.index({ nextExecution: 1 });

export default mongoose.models.CronJob || mongoose.model<ICronJob>('CronJob', CronJobSchema);
