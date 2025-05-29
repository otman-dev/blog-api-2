import mongoose from 'mongoose';
import adminDbConnect from '../lib/db/adminDb';

export interface IAutomationState extends mongoose.Document {
  service: string;
  isActive: boolean;
  lastUpdated: Date;
  lastPostGenerated: Date | null;
  interval: number;
  totalPostsGenerated: number;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for tracking automation state
const AutomationStateSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    unique: true,
    default: 'auto-blog-generation'
  },
  isActive: {
    type: Boolean,
    required: true,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastPostGenerated: {
    type: Date,
    default: null
  },
  interval: {
    type: Number,
    default: 10 * 60 * 1000 // 10 minutes in milliseconds
  },
  totalPostsGenerated: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Cache for the model to avoid re-compilation errors
let AutomationStateModel: mongoose.Model<IAutomationState> | null = null;

export async function getAutomationStateModel(): Promise<mongoose.Model<IAutomationState>> {
  if (AutomationStateModel) {
    return AutomationStateModel;
  }
  const connection = await adminDbConnect();
  
  // Check if model already exists in this connection to avoid overwrite error
  try {
    AutomationStateModel = connection.models.AutomationState || connection.model<IAutomationState>('AutomationState', AutomationStateSchema);
  } catch (error) {
    // If model already exists, use it
    AutomationStateModel = connection.models.AutomationState;
  }
  
  return AutomationStateModel;
}

// Helper functions for automation state management
export async function getAutomationState(): Promise<IAutomationState> {
  try {
    const AutomationStateModel = await getAutomationStateModel();
    let state = await AutomationStateModel.findOne({ service: 'auto-blog-generation' });
    
    if (!state) {
      // Create initial state if it doesn't exist
      state = new AutomationStateModel({
        service: 'auto-blog-generation',
        isActive: false,
        totalPostsGenerated: 0
      });
      await state.save();
      console.log('✅ Created initial automation state');
    }
    
    return state;
  } catch (error) {
    console.error('❌ Error getting automation state:', error);
    throw error;
  }
}

export async function setAutomationState(isActive: boolean): Promise<IAutomationState> {
  try {
    const AutomationStateModel = await getAutomationStateModel();
    const state = await AutomationStateModel.findOneAndUpdate(
      { service: 'auto-blog-generation' },
      { 
        isActive, 
        lastUpdated: new Date() 
      },
      { 
        new: true, 
        upsert: true // Create if doesn't exist
      }
    );
    
    console.log(`✅ Automation state updated: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
    return state!; // We know it exists because of upsert: true
  } catch (error) {
    console.error('❌ Error setting automation state:', error);
    throw error;
  }
}

export async function incrementPostCount(): Promise<void> {
  try {
    const AutomationStateModel = await getAutomationStateModel();
    await AutomationStateModel.findOneAndUpdate(
      { service: 'auto-blog-generation' },
      { 
        $inc: { totalPostsGenerated: 1 },
        lastPostGenerated: new Date(),
        lastUpdated: new Date()
      }
    );
    console.log('✅ Post count incremented');
  } catch (error) {
    console.error('❌ Error incrementing post count:', error);
  }
}

export default {
  getAutomationState,
  setAutomationState,
  incrementPostCount
};
