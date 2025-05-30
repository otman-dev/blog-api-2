/**
 * Simple test to verify narrative templates are working with admin database
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_ADMIN_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_ADMIN_URI environment variable is not set');
  process.exit(1);
}

// Simple schema for testing
const NarrativeTemplateSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: String,
  isActive: Boolean
});

async function testNarrativeTemplates() {
  console.log('🧪 Testing Narrative Templates in Admin Database...\n');

  try {
    // Connect to admin database
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to admin database');

    // Get the model
    const NarrativeTemplate = mongoose.model('NarrativeTemplate', NarrativeTemplateSchema);

    // Count templates
    const count = await NarrativeTemplate.countDocuments();
    console.log(`📊 Found ${count} narrative templates in admin database`);

    // Get all templates
    const templates = await NarrativeTemplate.find({ isActive: true }).select('id name type');
    console.log('\n📝 Available templates:');
    templates.forEach(template => {
      console.log(`   • ${template.name} (${template.type}) - ID: ${template.id}`);
    });

    // Test compatibility query
    const compatibleTemplates = await NarrativeTemplate.find({
      isActive: true,
      $or: [
        { categoryCompatibility: { $in: ['JavaScript', 'all'] } },
        { categoryCompatibility: { $size: 0 } }
      ]
    }).select('id name');

    console.log(`\n🎯 Templates compatible with JavaScript: ${compatibleTemplates.length}`);
    compatibleTemplates.forEach(template => {
      console.log(`   • ${template.name}`);
    });

    console.log('\n✅ Narrative templates are working correctly in admin database! 🎉');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('📦 Disconnected from database');
  }

  process.exit(0);
}

testNarrativeTemplates();
