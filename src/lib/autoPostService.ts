import dbConnect from './mongodb';
import Post from '@/models/Blog';
import { generateRandomPost } from './groq';

export class AutoPostService {
  private static instance: AutoPostService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  private constructor() {}

  public static getInstance(): AutoPostService {
    if (!AutoPostService.instance) {
      AutoPostService.instance = new AutoPostService();
    }
    return AutoPostService.instance;
  }
  public async createAutomaticPost(): Promise<void> {
    try {
      console.log('🤖 Generating new post with Groq AI...');
      
      // Generate post content using Groq
      const generatedPost = await generateRandomPost();
      
      // Connect to database
      await dbConnect();
      
      // Create and save the post with retry logic for duplicate slugs
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          const post = new Post({
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

  public startAutoGeneration(intervalMinutes: number = 10): void {
    if (this.isRunning) {
      console.log('⚠️ Auto generation is already running');
      return;
    }

    console.log(`🚀 Starting automatic post generation every ${intervalMinutes} minutes`);
    
    // Create first post immediately
    this.createAutomaticPost();
    
    // Set up interval for subsequent posts
    this.intervalId = setInterval(() => {
      this.createAutomaticPost();
    }, intervalMinutes * 60 * 1000); // Convert minutes to milliseconds
    
    this.isRunning = true;
  }

  public stopAutoGeneration(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('🛑 Automatic post generation stopped');
    }
  }

  public getStatus(): { isRunning: boolean } {
    return { isRunning: this.isRunning };
  }
}

export default AutoPostService;
