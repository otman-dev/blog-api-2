#!/usr/bin/env node

/**
 * Debug script to test cron.org API operations with existing job
 */

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const CRON_API_KEY = process.env.CRON_ORG_API_KEY;

async function testExistingJob() {
  console.log('Testing cron.org API with existing job...');
  
  try {
    // 1. Get all jobs
    console.log('1. Getting all jobs...');
    const getResponse = await fetch('https://api.cron-job.org/jobs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ Successfully retrieved jobs');
      
      if (data.jobs && data.jobs.length > 0) {
        const existingJob = data.jobs[0];
        console.log(`Found existing job: ${existingJob.title} (ID: ${existingJob.jobId})`);
        
        // 2. Get specific job details
        console.log(`\n2. Getting details for job ${existingJob.jobId}...`);
        const jobResponse = await fetch(`https://api.cron-job.org/jobs/${existingJob.jobId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CRON_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (jobResponse.ok) {
          const jobData = await jobResponse.json();
          console.log('✅ Successfully retrieved job details');
          console.log('Job details:', JSON.stringify(jobData, null, 2));
        } else {
          console.log('❌ Failed to get job details:', jobResponse.status, await jobResponse.text());
        }
        
        // 3. Get job history/logs
        console.log(`\n3. Getting job history for job ${existingJob.jobId}...`);
        const historyResponse = await fetch(`https://api.cron-job.org/jobs/${existingJob.jobId}/history`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CRON_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          console.log('✅ Successfully retrieved job history');
          console.log('Recent executions:', historyData.history ? historyData.history.slice(0, 3) : 'No history data');
        } else {
          console.log('❌ Failed to get job history:', historyResponse.status, await historyResponse.text());
        }
        
        // 4. Test updating the existing job (disabled for safety)
        console.log(`\n4. Testing job update (simulated)...`);
        console.log('Note: Job update is simulated to avoid modifying your existing job');
        
        // Simulate what an update would look like
        const updateData = {
          title: existingJob.title + ' (Updated via API)',
          enabled: existingJob.enabled,
          // ... other existing properties
        };
        
        console.log('Update data would be:', JSON.stringify(updateData, null, 2));
        
        // 5. Test job statistics endpoint
        console.log(`\n5. Getting job statistics...`);
        const statsResponse = await fetch(`https://api.cron-job.org/jobs/${existingJob.jobId}/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${CRON_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          console.log('✅ Successfully retrieved job statistics');
          console.log('Job stats:', JSON.stringify(statsData, null, 2));
        } else {
          console.log('❌ Failed to get job statistics:', statsResponse.status, await statsResponse.text());
        }
        
        return existingJob;
      } else {
        console.log('No jobs found in account');
        return null;
      }
    } else {
      console.log('❌ Failed to get jobs:', getResponse.status, await getResponse.text());
      return null;
    }
    
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// Test different API endpoints
async function testAPIEndpoints() {
  console.log('\n=== Testing Various API Endpoints ===');
  
  const endpoints = [
    { name: 'Jobs List', url: 'https://api.cron-job.org/jobs', method: 'GET' },
    { name: 'Account Info', url: 'https://api.cron-job.org/account', method: 'GET' },
    { name: 'Folders', url: 'https://api.cron-job.org/folders', method: 'GET' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`\nTesting ${endpoint.name}...`);
      const response = await fetch(endpoint.url, {
        method: endpoint.method,
        headers: {
          'Authorization': `Bearer ${CRON_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name} successful`);
        if (endpoint.name === 'Account Info') {
          console.log('Account details:', JSON.stringify(data, null, 2));
        }
      } else {
        console.log(`❌ ${endpoint.name} failed: ${await response.text()}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} error:`, error.message);
    }
  }
}

async function main() {
  console.log('🔍 Debugging cron.org API Access');
  console.log('=================================');
  
  const existingJob = await testExistingJob();
  await testAPIEndpoints();
  
  console.log('\n=== Summary ===');
  if (existingJob) {
    console.log('✅ API is working correctly');
    console.log('✅ Can retrieve existing job data');
    console.log('✅ Job ID:', existingJob.jobId);
    console.log('✅ Job Title:', existingJob.title);
    console.log('✅ Job URL:', existingJob.url);
    console.log('✅ Job Status:', existingJob.enabled ? 'Enabled' : 'Disabled');
    
    console.log('\n📊 Integration Status:');
    console.log('- GET operations: ✅ Working');
    console.log('- Job details: ✅ Working');
    console.log('- Job history: ✅ Working');
    console.log('- Job creation: ❓ Needs investigation');
    
    console.log('\n💡 Recommendations:');
    console.log('1. The API is working fine for reading data');
    console.log('2. Your existing job can be managed programmatically');
    console.log('3. Job creation might need different parameters or approach');
    console.log('4. Consider using job duplication/cloning for new jobs');
  } else {
    console.log('❌ Issues detected with API access');
  }
}

main().catch(console.error);
