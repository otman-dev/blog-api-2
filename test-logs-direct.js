#!/usr/bin/env node

/**
 * Test logs endpoint directly without authentication
 */

async function testLogsEndpoint() {
  console.log('Testing logs endpoint directly...');
  
  const baseUrl = 'http://localhost:3000'; // Adjust if different
  
  try {
    console.log('1. Testing logs endpoint without auth...');
    const response = await fetch(`${baseUrl}/api/cron/logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Logs endpoint is working');
      console.log(`Found ${data.executions?.length || 0} executions`);
    } else {
      console.log('❌ Logs endpoint returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

async function testLogsWithAuth() {
  console.log('\n2. Testing logs endpoint with auth token...');
  
  const baseUrl = 'http://localhost:3000';
  const authToken = 'test-token'; // You can replace with a real token if needed
  
  try {
    const response = await fetch(`${baseUrl}/api/cron/logs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Logs endpoint works with auth token');
      console.log(`Found ${data.executions?.length || 0} executions`);
    } else {
      console.log('❌ Logs endpoint returned error with auth:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Network error with auth:', error.message);
  }
}

async function main() {
  console.log('🔍 Testing Logs Endpoint');
  console.log('========================');
  
  await testLogsEndpoint();
  await testLogsWithAuth();
  
  console.log('\n💡 If the endpoint works here but not in the UI,');
  console.log('   the issue is likely in the frontend apiFetch function');
}

main().catch(console.error);
