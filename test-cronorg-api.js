#!/usr/bin/env node

/**
 * Test cron.org API access directly to see what's happening
 */

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const CRON_API_KEY = process.env.CRON_ORG_API_KEY;

async function testCronOrgAPI() {
  console.log('Testing cron.org API directly...');
  console.log('API Key present:', !!CRON_API_KEY);
  console.log('API Key length:', CRON_API_KEY ? CRON_API_KEY.length : 0);
  
  if (!CRON_API_KEY) {
    console.error('❌ No API key found in .env file');
    return;
  }
  
  try {
    console.log('\nMaking request to cron.org API...');
    const response = await fetch('https://api.cron-job.org/jobs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response text length:', responseText.length);
    console.log('Raw response (first 500 chars):', responseText.substring(0, 500));
    
    if (responseText.trim() === '') {
      console.log('❌ EMPTY RESPONSE - This is the source of "Unexpected end of JSON input"');
      return;
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('✅ Valid JSON response');
      console.log('Jobs found:', data.jobs ? data.jobs.length : 'No jobs property');
      
      if (data.jobs && data.jobs.length > 0) {
        console.log('First job:', {
          id: data.jobs[0].jobId,
          title: data.jobs[0].title,
          enabled: data.jobs[0].enabled
        });
      }
    } catch (jsonError) {
      console.log('❌ JSON parsing failed:', jsonError.message);
      console.log('This is the source of "Unexpected end of JSON input"');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testCronOrgAPI();
