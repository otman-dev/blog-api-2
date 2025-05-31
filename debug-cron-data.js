const https = require('https');

async function testSyncEndpoint() {
  console.log('Testing sync endpoint...');
  
  try {
    // First, let's check the current jobs endpoint
    console.log('1. Checking current jobs...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/cron/jobs',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    // This will only work if the Next.js server is running
    console.log('Note: This test requires the Next.js server to be running on localhost:3000');
    console.log('Please start the server with: npm run dev');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Let's instead directly test with the debug script we already know works
console.log('Let\'s test the cron.org API directly and see what data we can get...');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function debugCronOrgData() {
  const CRON_API_KEY = process.env.CRON_ORG_API_KEY;
  
  console.log('CRON_ORG_API_KEY exists:', !!CRON_API_KEY);
  
  if (!CRON_API_KEY) {
    console.error('Missing CRON_ORG_API_KEY in environment variables');
    return;
  }
  
  try {
    console.log('Fetching jobs from cron.org...');
    
    const response = await fetch('https://api.cron-job.org/jobs', {
      headers: {
        'Authorization': `Bearer ${CRON_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Jobs response:', JSON.stringify(data, null, 2));
    
    if (data.jobs && data.jobs.length > 0) {
      const job = data.jobs[0];
      console.log(`\nTesting history for job ${job.jobId}...`);
      
      // Get job history
      const historyResponse = await fetch(`https://api.cron-job.org/jobs/${job.jobId}/history`, {
        headers: {
          'Authorization': `Bearer ${CRON_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        console.log('History response:', JSON.stringify(historyData, null, 2));
      } else {
        console.log('History request failed:', historyResponse.status, historyResponse.statusText);
      }
    }
    
  } catch (error) {
    console.error('Error fetching from cron.org:', error);
  }
}

debugCronOrgData();
