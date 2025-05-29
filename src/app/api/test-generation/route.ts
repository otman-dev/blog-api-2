import { NextRequest, NextResponse } from 'next/server';
import { generateRandomPost } from '@/lib/groq';

export async function GET() {
  try {
    console.log('🧪 Testing article generation...');
    
    // Generate a test article
    const generatedPost = await generateRandomPost();
    
    console.log('✅ Test article generated successfully');
    console.log('📊 Article stats:', {
      titleLength: generatedPost.title.length,
      contentLength: generatedPost.content.length,
      excerptLength: generatedPost.excerpt.length,
      categoriesCount: generatedPost.categories.length,
      tagsCount: generatedPost.tags.length
    });
    
    return NextResponse.json({
      success: true,
      message: 'Article generated successfully',
      article: generatedPost,
      stats: {
        titleLength: generatedPost.title.length,
        contentLength: generatedPost.content.length,
        excerptLength: generatedPost.excerpt.length,
        wordCount: generatedPost.content.split(' ').length,
        categoriesCount: generatedPost.categories.length,
        tagsCount: generatedPost.tags.length
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error testing article generation:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to generate test article',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
