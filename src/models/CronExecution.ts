import mongoose, { Schema, Document } from 'mongoose';

export interface ICronExecution extends Document {
  cronJobId: mongoose.Types.ObjectId;
  cronOrgJobId?: number;
  executionId?: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'timeout';
  startTime: Date;
  endTime?: Date;
  duration?: number; // in milliseconds
  httpStatus?: number;
  response?: {
    body?: string;
    headers?: { [key: string]: string };
    size?: number;
  };
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  retryAttempt: number;
  triggeredBy: 'schedule' | 'manual' | 'retry';
  metadata?: {
    userAgent?: string;
    ip?: string;
    executedBy?: string;
  };
}

const CronExecutionSchema: Schema = new Schema({
  cronJobId: { 
    type: Schema.Types.ObjectId, 
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
}, {
  timestamps: true
});

// Indexes for efficient queries
CronExecutionSchema.index({ cronJobId: 1, startTime: -1 });
CronExecutionSchema.index({ status: 1, startTime: -1 });
CronExecutionSchema.index({ startTime: -1 });

export default mongoose.models.CronExecution || mongoose.model<ICronExecution>('CronExecution', CronExecutionSchema);
