const { MongoClient } = require('mongodb');
require('dotenv').config();

async function debugExecutions() {
  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Check cron jobs
    const jobs = await db.collection('cronjobs').find({}).toArray();
    console.log('\n=== CRON JOBS ===');
    console.log(`Found ${jobs.length} jobs:`);
    jobs.forEach(job => {
      console.log(`- ${job.title} (ID: ${job._id})`);
      console.log(`  Status: ${job.status}`);
      console.log(`  CronJobId: ${job.cronJobId}`);
      console.log(`  Last Execution: ${job.lastExecution || 'N/A'}`);
      console.log(`  Next Execution: ${job.nextExecution || 'N/A'}`);
    });
    
    // Check executions
    const executions = await db.collection('cronexecutions').find({}).toArray();
    console.log('\n=== CRON EXECUTIONS ===');
    console.log(`Found ${executions.length} executions:`);
    executions.forEach(exec => {
      console.log(`- Job ID: ${exec.jobId}`);
      console.log(`  Status: ${exec.status}`);
      console.log(`  Start Time: ${exec.startTime}`);
      console.log(`  End Time: ${exec.endTime || 'N/A'}`);
      console.log(`  Duration: ${exec.duration || 'N/A'}`);
      console.log(`  HTTP Status: ${exec.httpStatus || 'N/A'}`);
    });
    
    // Check statistics calculation
    const totalJobs = await db.collection('cronjobs').countDocuments();
    const activeJobs = await db.collection('cronjobs').countDocuments({ status: 'active' });
    const pausedJobs = await db.collection('cronjobs').countDocuments({ status: 'paused' });
    const failedJobs = await db.collection('cronjobs').countDocuments({ status: 'error' });
    
    const totalExecutions = await db.collection('cronexecutions').countDocuments();
    const successfulExecutions = await db.collection('cronexecutions').countDocuments({ status: 'success' });
    const failedExecutions = await db.collection('cronexecutions').countDocuments({ status: 'failed' });
    
    console.log('\n=== STATISTICS ===');
    console.log(`Total Jobs: ${totalJobs}`);
    console.log(`Active Jobs: ${activeJobs}`);
    console.log(`Paused Jobs: ${pausedJobs}`);
    console.log(`Failed Jobs: ${failedJobs}`);
    console.log(`Total Executions: ${totalExecutions}`);
    console.log(`Successful Executions: ${successfulExecutions}`);
    console.log(`Failed Executions: ${failedExecutions}`);
    console.log(`Success Rate: ${totalExecutions > 0 ? ((successfulExecutions / totalExecutions) * 100).toFixed(1) : 0}%`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugExecutions();
