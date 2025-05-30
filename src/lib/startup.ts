import AutoPostService from '@/lib/autoPostService';
import { TechTopicService } from '@/lib/techTopicService';
import { GroqModelService } from '@/lib/groqModelService';
import { CategoryService } from '@/lib/categoryService';

// Auto-start the post generation service when the module is imported
if (typeof window === 'undefined') { // Only run on server side
  // Initialize TechTopic collection from JSON file if needed
  const techTopicService = TechTopicService.getInstance();
  
  console.log('🔄 Initializing tech topics from JSON file if needed...');
  techTopicService.seedTopicsFromFile().then(() => {
    console.log('✅ Tech topics initialization completed');
  }).catch(error => {
    console.error('❌ Error initializing tech topics:', error);
  });
    // Initialize Groq models collection from JSON file if needed
  const groqModelService = GroqModelService.getInstance();
  
  console.log('🔄 Initializing Groq models from JSON file if needed...');
  groqModelService.seedModelsFromFile().then(() => {
    console.log('✅ Groq models initialization completed');
  }).catch(error => {
    console.error('❌ Error initializing Groq models:', error);
  });
  
  // Initialize Categories collection from JSON file if needed
  const categoryService = CategoryService.getInstance();
  
  console.log('🔄 Initializing categories from JSON file if needed...');
  categoryService.seedCategoriesFromFile().then(() => {
    console.log('✅ Categories initialization completed');
  }).catch(error => {
    console.error('❌ Error initializing categories:', error);
  });

  const autoService = AutoPostService.getInstance();
  // Start auto-generation every 10 minutes
  setTimeout(() => {
    autoService.startAutoGeneration(10);
    console.log('🚀 Auto post generation service started automatically');
  }, 5000); // Wait 5 seconds after server start
}

export default AutoPostService;
