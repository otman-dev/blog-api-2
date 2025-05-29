import { NextResponse } from 'next/server';
import adminDbConnect from '@/lib/db/adminDb';
import mongoose from 'mongoose';

// Newsletter subscriber schema
const NewsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    default: 'coming-soon-page'
  }
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Connect to admin database
    const adminDb = await adminDbConnect();
    
    // Get or create Newsletter model
    const Newsletter = adminDb.models.Newsletter || adminDb.model('Newsletter', NewsletterSchema);

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { success: false, error: 'This email is already subscribed to our newsletter' },
          { status: 409 }
        );
      } else {
        // Reactivate if previously unsubscribed
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();
        
        return NextResponse.json({
          success: true,
          message: 'Welcome back! Your subscription has been reactivated.'
        });
      }
    }

    // Create new subscriber
    const newSubscriber = new Newsletter({
      email,
      subscribedAt: new Date(),
      isActive: true,
      source: 'coming-soon-page'
    });

    await newSubscriber.save();

    console.log(`✅ New newsletter subscriber: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! We\'ll notify you when we launch.'
    });

  } catch (error: any) {
    console.error('❌ Newsletter signup error:', error);
    
    if (error.code === 11000) {
      // Duplicate key error
      return NextResponse.json(
        { success: false, error: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve newsletter stats (admin only)
export async function GET(request: Request) {
  try {
    // You could add authentication here to protect this endpoint
    const adminDb = await adminDbConnect();
    const Newsletter = adminDb.models.Newsletter;
    
    if (!Newsletter) {
      return NextResponse.json({
        success: true,
        data: { totalSubscribers: 0, activeSubscribers: 0 }
      });
    }

    const totalSubscribers = await Newsletter.countDocuments();
    const activeSubscribers = await Newsletter.countDocuments({ isActive: true });

    return NextResponse.json({
      success: true,
      data: {
        totalSubscribers,
        activeSubscribers,
        inactiveSubscribers: totalSubscribers - activeSubscribers
      }
    });

  } catch (error) {
    console.error('❌ Newsletter stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve newsletter stats' },
      { status: 500 }
    );
  }
}
