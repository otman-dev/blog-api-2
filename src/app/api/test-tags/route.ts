import { NextResponse } from 'next/server';
import { TagService } from '@/lib/tagService';
import getTagModel from '@/models/Tag';
import dbConnect from '@/lib/db/contentDb';

export async function GET() {
  try {
    console.log('🔍 Testing tag creation...');
    
    // Connect to database manually
    const connection = await dbConnect();
    console.log(`📊 Connected to database: ${connection.name}`);
    
    // Get Tag model
    const TagModel = await getTagModel();
    console.log(`🔧 Tag model collection name: ${TagModel.collection.name}`);
    
    // Test querying tags
    const existingTags = await TagModel.find().lean();
    console.log(`📋 Existing tags count: ${existingTags.length}`);
    console.log(`📋 Existing tags: ${existingTags.map(t => t.name).join(', ')}`);
    
    // Test creating tags
    const tagService = TagService.getInstance();
    const testTagNames = [
      "Tutorial", 
      "JavaScript", 
      "DevOps", 
      "Security",
      "Performance"
    ];
    
    console.log(`📝 Creating test tags: ${testTagNames.join(', ')}`);
    const tagIds = await tagService.ensureTagsExist(testTagNames);
    console.log(`✅ Created test tags with IDs: ${tagIds.join(', ')}`);
    
    // Verify by querying again
    const updatedTags = await TagModel.find().lean();
    console.log(`📋 Updated tags count: ${updatedTags.length}`);
    
    return NextResponse.json({
      success: true,
      database: connection.name,
      tagModelCollection: TagModel.collection.name,
      existingTagsCount: existingTags.length,
      existingTags: existingTags.map(t => ({name: t.name, id: t.id})),
      testTags: testTagNames,
      tagIds: tagIds,
      updatedTagsCount: updatedTags.length,
      createdTags: updatedTags.filter(t => testTagNames.includes(t.name)).map(t => ({
        name: t.name,
        id: t.id,
        slug: t.slug,
        color: t.color
      }))
    });
  } catch (error) {
    console.error('❌ Error testing tag creation:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to test tag creation', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
