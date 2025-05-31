const { CronService } = require('./src/lib/cronService.ts');
require('dotenv').config();

async function testSync() {
  console.log('Testing cron sync functionality...');
  
  const cronService = new CronService();
  
  try {
    console.log('1. Testing sync jobs...');
    const syncResult = await cronService.syncJobs();
    console.log('Sync result:', syncResult);
    
    if (syncResult.success) {
      console.log(`\n2. Successfully synced ${syncResult.synced} jobs`);
      
      // Now test getting jobs
      console.log('3. Testing get jobs...');
      const jobsResult = await cronService.getJobs();
      console.log('Jobs result:', jobsResult);
      
      if (jobsResult.success && jobsResult.jobs) {
        console.log(`Found ${jobsResult.jobs.length} jobs in database:`);
        jobsResult.jobs.forEach(job => {
          console.log(`- ${job.title} (Status: ${job.status})`);
        });
      }
      
      // Test statistics
      console.log('\n4. Testing statistics...');
      const statsResult = await cronService.getJobStatistics();
      console.log('Statistics result:', statsResult);
    } else {
      console.error('Sync failed:', syncResult.error);
    }
    
  } catch (error) {
    console.error('Error testing sync:', error);
  }
}

testSync();
