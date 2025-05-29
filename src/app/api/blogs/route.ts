import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Blog';
import { generateRandomPost } from '@/lib/groq';

export async function GET() {
  try {
    await dbConnect();
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
    const body = await request.json();
    
    // Check if this is a post generation request
    if (body.generateWithGroq) {
      // Generate post content using Groq
      const generatedPost = await generateRandomPost();
      
      // Connect to database and save the generated post
      await dbConnect();
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
      });
    } else {
      // Direct post creation
      const { title, content, excerpt, categories, tags, published, status } = body;
      
      await dbConnect();
      const post = new Post({
        title,
        content,
        excerpt,
        author: 'Mouhib Otman',
        categories: categories || [],
        tags: tags || [],
        status: status || 'published',
        published: published !== undefined ? published : true,
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
