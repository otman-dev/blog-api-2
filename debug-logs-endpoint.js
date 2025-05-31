const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testLogsEndpoint() {
  console.log('Testing logs endpoint...');
  
  try {
    // First, get the jobs to find a job ID
    console.log('1. Getting jobs to find a job ID...');
    
    const jobsResponse = await fetch('http://localhost:3000/api/cron/jobs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!jobsResponse.ok) {
      console.error('Jobs request failed:', jobsResponse.status, jobsResponse.statusText);
      const errorText = await jobsResponse.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const jobsData = await jobsResponse.json();
    console.log('Jobs response:', JSON.stringify(jobsData, null, 2));
    
    if (jobsData.success && jobsData.jobs && jobsData.jobs.length > 0) {
      const firstJob = jobsData.jobs[0];
      console.log(`\n2. Testing logs for job ${firstJob._id} (${firstJob.title})...`);
      
      const logsResponse = await fetch(`http://localhost:3000/api/cron/logs?jobId=${firstJob._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Logs response status:', logsResponse.status, logsResponse.statusText);
      const logsData = await logsResponse.text();
      console.log('Logs response:', logsData);
      
    } else {
      console.log('No jobs found to test logs with');
    }
    
  } catch (error) {
    console.error('Error testing logs:', error);
  }
}

console.log('Note: Make sure the Next.js server is running on localhost:3000');
console.log('Run: npm run dev');
console.log('Then run this script to test the logs endpoint\n');

testLogsEndpoint();
