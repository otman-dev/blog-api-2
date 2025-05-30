import { NextRequest, NextResponse } from 'next/server';
import getBlogModel from '@/models/Blog';
import { generateRandomPost } from '@/lib/groqWithMinimalPrompts';
import { requireAuth } from '@/lib/middleware';
import { CategoryService } from '@/lib/categoryService';

export async function GET() {
  try {
    const Post = await getBlogModel();
    const posts = await Post.find({ published: true }).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication before proceeding
    try {
      await requireAuth(request);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
      // Check if this is a post generation request
    if (body.generateWithGroq) {
      // Generate post content using Groq
      const generatedPost = await generateRandomPost();
      
      // Ensure categories exist in database
      const categoryService = CategoryService.getInstance();
      await categoryService.ensureCategoriesExist(generatedPost.categories);
      
      // Get blog model and save the generated post
      const Post = await getBlogModel();
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
      
      return NextResponse.json({
        success: true,
        data: savedPost,
        generated: true
      });    } else {
      // Direct post creation
      const { title, content, excerpt } = body;
      const categories = body.categories || [];
      const tags = body.tags || [];
      const status = body.status || 'published';
      const published = body.published !== undefined ? body.published : true;
      
      // Ensure categories exist in database if provided
      if (categories.length > 0) {
        const categoryService = CategoryService.getInstance();
        await categoryService.ensureCategoriesExist(categories);
      }
      
      const Post = await getBlogModel();
      const post = new Post({
        title,
        content,
        excerpt,
        author: 'Mouhib Otman',
        categories,
        tags,
        status,
        published,
        publishedAt: new Date()
      });
      
      const savedPost = await post.save();
      
      return NextResponse.json({
        success: true,
        data: savedPost
      });
    }
  } catch (error) {
    console.error('Error creating/generating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
