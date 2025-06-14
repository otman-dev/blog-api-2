import { NextRequest, NextResponse } from 'next/server';
import getBlogModel from '@/models/Blog';
import { generateRandomPost } from '@/lib/groqWithMinimalPrompts';
import { requireAuth } from '@/lib/middleware';
import { CategoryService } from '@/lib/categoryService';
import { TagService } from '@/lib/tagService';

// Function to generate unique custom ID
function generateCustomId(): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `post_${timestamp}_${randomStr}`;
}

export async function GET() {
  try {
    console.log('📥 GET /api/blogs - Fetching published posts...');
    const Post = await getBlogModel();
    const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
    
    console.log(`✅ GET /api/blogs - Successfully retrieved ${posts.length} published posts`);
    return NextResponse.json({
      success: true,
      data: posts
    });  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    
    console.error('❌ GET /api/blogs - Database error while fetching posts:', {
      error: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      operation: 'fetch_published_posts'
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts from database' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let operationType = 'unknown';
  
  try {
    console.log('📤 POST /api/blogs - Starting blog creation request...');
    
    // Check authentication before proceeding
    try {
      await requireAuth(request);
      console.log('🔐 POST /api/blogs - Authentication successful');
    } catch (error) {
      console.warn('🚫 POST /api/blogs - Authentication failed:', {
        error: error instanceof Error ? error.message : 'Unknown auth error',
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Check if this is a post generation request
    if (body.generateWithGroq) {
      operationType = 'groq_generation';
      console.log('🤖 POST /api/blogs - Starting Groq AI post generation...');
      
      // Generate post content using Groq
      const generatedPost = await generateRandomPost();
      console.log('✅ POST /api/blogs - Groq generation completed:', {
        title: generatedPost.title.substring(0, 50) + '...',
        categories: generatedPost.categories,
        tags: generatedPost.tags,
        contentLength: generatedPost.content.length,
        excerptLength: generatedPost.excerpt.length
      });
      
      // Get blog model and save the generated post FIRST
      const Post = await getBlogModel();
      const customId = generateCustomId();
      console.log('🆔 POST /api/blogs - Generated custom ID:', customId);
      
      const post = new Post({
        id: customId,
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
      
      console.log('💾 POST /api/blogs - Saving generated post to database...', {
        customId,
        title: generatedPost.title.substring(0, 30) + '...',
        categoriesCount: generatedPost.categories.length,
        tagsCount: generatedPost.tags.length
      });
        const savedPost = await post.save();
      
      console.log('🎉 POST /api/blogs - Generated post successfully saved to database:', {
        operation: 'groq_generation',
        postId: savedPost._id,
        customId: savedPost.id,
        title: savedPost.title.substring(0, 50) + '...',
        slug: savedPost.slug,
        categories: savedPost.categories,
        tags: savedPost.tags,
        contentLength: savedPost.content.length,
        createdAt: savedPost.createdAt,        timeTaken: `${Date.now() - startTime}ms`
      });
      
      // Only AFTER successful post creation, ensure categories and tags exist in database
      console.log('🏷️ POST /api/blogs - Creating categories and tags for generated post...');
      try {
        const categoryService = CategoryService.getInstance();
        await categoryService.ensureCategoriesExist(generatedPost.categories);
        console.log('📁 POST /api/blogs - Categories ensured:', generatedPost.categories);
        
        const tagService = TagService.getInstance();
        await tagService.ensureTagsExist(generatedPost.tags);
        console.log('🏷️ POST /api/blogs - Tags ensured successfully:', generatedPost.tags);
      } catch (tagError) {
        const errorMessage = tagError instanceof Error ? tagError.message : 'Unknown tag error';
        console.warn('⚠️ POST /api/blogs - Post saved but failed to create some tags/categories:', {
          error: errorMessage,
          postId: savedPost._id,
          customId: savedPost.id,
          attemptedCategories: generatedPost.categories,
          attemptedTags: generatedPost.tags,          timestamp: new Date().toISOString()
        });
        // Don't fail the entire request if tags/categories fail - post is already saved
      }
      
      console.log('🎉 POST /api/blogs - Groq generation completed successfully:', {
        totalTime: `${Date.now() - startTime}ms`,
        postId: savedPost._id,
        customId: savedPost.id
      });
      
      return NextResponse.json({
        success: true,
        data: savedPost,
        generated: true
      });
    } else {
      operationType = 'manual_creation';
      console.log('✍️ POST /api/blogs - Starting manual post creation...');
      
      // Direct post creation
      const { title, content, excerpt } = body;
      const categories = body.categories || [];
      const tags = body.tags || [];
      const status = body.status || 'published';
      const published = body.published !== undefined ? body.published : true;
      
      console.log('📝 POST /api/blogs - Manual post details:', {
        title: title?.substring(0, 50) + '...' || 'No title',
        contentLength: content?.length || 0,
        excerptLength: excerpt?.length || 0,
        categoriesCount: categories.length,
        tagsCount: tags.length,
        status,        published
      });
      
      // Save the post FIRST, before creating tags/categories
      const Post = await getBlogModel();
      const customId = generateCustomId();
      console.log('🆔 POST /api/blogs - Generated custom ID for manual post:', customId);
      
      const post = new Post({
        id: customId,
        title,
        content,
        excerpt,
        author: 'Mouhib Otman',
        categories,
        tags,
        status,
        published,
        publishedAt: new Date()      });
      
      console.log('💾 POST /api/blogs - Saving manual post to database...', {
        customId,
        title: title?.substring(0, 30) + '...' || 'No title',
        categoriesCount: categories.length,
        tagsCount: tags.length
      });
      
      const savedPost = await post.save();
      
      console.log('🎉 POST /api/blogs - Manual post successfully saved to database:', {
        operation: 'manual_creation',
        postId: savedPost._id,
        customId: savedPost.id,
        title: savedPost.title.substring(0, 50) + '...',
        slug: savedPost.slug,
        categories: savedPost.categories,
        tags: savedPost.tags,
        status: savedPost.status,
        published: savedPost.published,
        createdAt: savedPost.createdAt,
        timeTaken: `${Date.now() - startTime}ms`
      });
      
      // Only AFTER successful post creation, ensure categories and tags exist in database
      console.log('🏷️ POST /api/blogs - Creating categories and tags for manual post...');
      try {
        if (categories.length > 0) {
          const categoryService = CategoryService.getInstance();
          await categoryService.ensureCategoriesExist(categories);
        }
          if (categories.length > 0) {
          const categoryService = CategoryService.getInstance();
          await categoryService.ensureCategoriesExist(categories);
          console.log('📁 POST /api/blogs - Categories ensured:', categories);
        }
        
        if (tags.length > 0) {
          const tagService = TagService.getInstance();
          await tagService.ensureTagsExist(tags);
          console.log('🏷️ POST /api/blogs - Tags ensured successfully:', tags);
        }
      } catch (tagError) {
        const errorMessage = tagError instanceof Error ? tagError.message : 'Unknown tag error';
        console.warn('⚠️ POST /api/blogs - Manual post saved but failed to create some tags/categories:', {
          error: errorMessage,
          postId: savedPost._id,
          customId: savedPost.id,
          attemptedCategories: categories,
          attemptedTags: tags,
          timestamp: new Date().toISOString()
        });
        // Don't fail the entire request if tags/categories fail - post is already saved
      }
      
      console.log('🎉 POST /api/blogs - Manual creation completed successfully:', {
        totalTime: `${Date.now() - startTime}ms`,
        postId: savedPost._id,
        customId: savedPost.id
      });
      
      return NextResponse.json({
        success: true,
        data: savedPost
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';
    
    console.error('❌ POST /api/blogs - Critical error during post creation:', {
      operation: operationType,
      error: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`,
      requestBody: {
        hasTitle: !!(request.body && JSON.stringify(request.body).includes('title')),
        hasContent: !!(request.body && JSON.stringify(request.body).includes('content')),
        isGroqGeneration: !!(request.body && JSON.stringify(request.body).includes('generateWithGroq'))
      }
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: `Failed to create post: ${errorMessage}`,
        operation: operationType 
      },
      { status: 500 }
    );
  }
}
