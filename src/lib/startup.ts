import AutoPostService from '@/lib/autoPostService';

// Auto-start the post generation service when the module is imported
if (typeof window === 'undefined') { // Only run on server side
  console.log('� Server-side initialization...');
  
  // Data is now managed directly in MongoDB, no JSON file seeding needed
  console.log('ℹ️ Tech topics, categories, and models are managed in MongoDB');

  const autoService = AutoPostService.getInstance();
  // Start auto-generation every 10 minutes
  setTimeout(() => {
    autoService.startAutoGeneration(10);
    console.log('🚀 Auto post generation service started automatically');
  }, 5000); // Wait 5 seconds after server start
}

export default AutoPostService;
