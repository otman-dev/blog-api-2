#!/usr/bin/env node

/**
 * Quick test to verify logs endpoint is working
 */

async function quickTest() {
  console.log('Quick logs endpoint test...');
  
  try {
    console.log('Testing /api/cron/logs...');
    const response = await fetch('http://localhost:3000/api/cron/logs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Success:', data.success);
      console.log('Executions found:', data.executions?.length || 0);
      
      if (data.executions && data.executions.length > 0) {
        console.log('Sample execution:', {
          id: data.executions[0]._id,
          status: data.executions[0].status,
          startTime: data.executions[0].startTime,
          duration: data.executions[0].duration
        });
      }
    } else {
      console.log('Failed with status:', response.status);
      const text = await response.text();
      console.log('Response:', text);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

quickTest();
