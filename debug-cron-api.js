#!/usr/bin/env node

/**
 * Simple cron.org API test to debug the job creation issue
 */

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const CRON_API_KEY = process.env.CRON_ORG_API_KEY;

async function testAPI() {
  console.log('Testing cron.org API with minimal job...');
  
  // First, let's get the current jobs to see the format
  try {
    console.log('1. Getting current jobs...');
    const getResponse = await fetch('https://api.cron-job.org/jobs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('Current jobs response:', JSON.stringify(data, null, 2));
    } else {
      console.log('Failed to get jobs:', getResponse.status, await getResponse.text());
    }    // Try creating a minimal job with exact format from existing job
    console.log('\n2. Creating minimal test job...');
    const minimalJob = {
      title: 'Test Job via API',
      url: 'https://httpbin.org/get',
      enabled: false,
      saveResponses: false,
      type: 1,
      requestTimeout: 30,
      redirectSuccess: false,
      folderId: 0,
      schedule: {
        timezone: 'UTC',
        hours: [-1],
        mdays: [-1], 
        minutes: [0],
        months: [-1],
        wdays: [-1],
        expiresAt: 0
      },
      requestMethod: 1
    };    // Try creating a job with a specific job ID (new job)
    console.log('\n2. Creating test job with job ID...');
    const jobId = Math.floor(Math.random() * 1000000) + 7000000; // Random high ID
    
    const createResponse = await fetch(`https://api.cron-job.org/jobs/${jobId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CRON_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(minimalJob)
    });
    
    console.log('Create response status:', createResponse.status);
    const responseText = await createResponse.text();
    console.log('Create response body:', responseText);
    
    if (createResponse.ok) {
      const data = JSON.parse(responseText);
      console.log('Job created successfully:', data);
      
      // Clean up
      if (data.jobId) {
        await fetch(`https://api.cron-job.org/jobs/${data.jobId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${CRON_API_KEY}`
          }
        });
        console.log('Job cleaned up');
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();
