import dbConnect from './db/contentDb';
import getBlogModel from '@/models/Blog';
import { generateRandomPost } from './groqWithMinimalPrompts';
import { getAutomationState, setAutomationState, incrementPostCount } from '../models/AutomationState';
import { CategoryService } from './categoryService';
import { TagService } from './tagService';

export class AutoPostService {
  private static instance: AutoPostService;
  private intervalId: NodeJS.Timeout | null = null;
  
  private constructor() {}

  public static getInstance(): AutoPostService {
    if (!AutoPostService.instance) {
      AutoPostService.instance = new AutoPostService();
    }
    return AutoPostService.instance;
  }

  public async isRunning(): Promise<boolean> {
    try {
      const state = await getAutomationState();
      return state.isActive;
    } catch (error) {
      console.error('Error checking automation state:', error);
      return false;
    }
  }
  public async createAutomaticPost(): Promise<void> {
    try {
      console.log('🤖 Generating new post with Groq AI...');
        // Generate post content using Groq
      const generatedPost = await generateRandomPost();
      
      // Connect to database and get blog model
      const BlogModel = await getBlogModel();
        // Ensure all categories exist in the database
      const categoryService = CategoryService.getInstance();
      const categoryIds = await categoryService.ensureCategoriesExist(generatedPost.categories);
      
      // Ensure all tags exist in the database
      const tagService = TagService.getInstance();
      await tagService.ensureTagsExist(generatedPost.tags);
      
      // Create and save the post with retry logic for duplicate slugs
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const post = new BlogModel({
            title: generatedPost.title,
            content: generatedPost.content,
            excerpt: generatedPost.excerpt,
            author: 'Mouhib Otman',
            categories: generatedPost.categories,
            tags: generatedPost.tags,
            status: 'published',
            published: true,
            publishedAt: new Date()
          });
          
          const savedPost = await post.save();
            console.log('✅ New post created successfully:', {
            id: savedPost._id,
            title: savedPost.title,
            slug: savedPost.slug,
            publishedAt: savedPost.publishedAt
          });

          // Increment the post count in the database
          await incrementPostCount();
          
          return; // Success, exit the function
          
        } catch (saveError: any) {
          attempts++;
          
          if (saveError.code === 11000 && attempts < maxAttempts) {
            console.log(`⚠️ Duplicate slug detected, retrying (attempt ${attempts}/${maxAttempts})...`);
            // Add small delay and continue to next attempt
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          } else {
            throw saveError; // Re-throw if not duplicate error or max attempts reached
          }
        }
      }
      
      console.error('❌ Failed to create post after maximum attempts due to duplicate slugs');
      
    } catch (error) {
      console.error('❌ Error creating automatic post:', error);
    }
  }
  public async startAutoGeneration(intervalMinutes: number = 10): Promise<void> {
    const currentlyRunning = await this.isRunning();
    if (currentlyRunning) {
      console.log('⚠️ Auto generation is already running');
      return;
    }

    console.log(`🚀 Starting automatic post generation every ${intervalMinutes} minutes`);
    
    // Set state to active in database
    await setAutomationState(true);
    
    // Create first post immediately
    this.createAutomaticPost();
    
    // Set up interval for subsequent posts
    this.intervalId = setInterval(async () => {
      // Check if still active before generating
      const isActive = await this.isRunning();
      if (isActive) {
        this.createAutomaticPost();
      } else {
        // If deactivated, stop the interval
        this.stopAutoGeneration();
      }
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds
  }

  public async stopAutoGeneration(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Automatic post generation stopped');
    }
    
    // Set state to inactive in database
    await setAutomationState(false);
  }
  public async getStatus(): Promise<{ isRunning: boolean; totalPosts?: number; lastGenerated?: Date }> {
    try {
      const state = await getAutomationState();
      return { 
        isRunning: state.isActive,
        totalPosts: state.totalPostsGenerated,
        lastGenerated: state.lastPostGenerated || undefined
      };
    } catch (error) {
      console.error('Error getting status:', error);
      return { isRunning: false };
    }
  }
}

export default AutoPostService;
