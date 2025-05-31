#!/usr/bin/env node

/**
 * Test sync endpoint directly to diagnose JSON parsing issue
 */

async function testSyncEndpoint() {
  console.log('Testing sync endpoint...');
  
  // First, let's get a token by logging in
  try {
    console.log('1. Attempting login to get token...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      console.log('Login failed:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('Login success:', !!loginData.token);
    
    if (!loginData.token) {
      console.log('No token received');
      return;
    }
    
    // Now test the sync endpoint
    console.log('\n2. Testing sync endpoint...');
    const syncResponse = await fetch('http://localhost:3000/api/cron/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      }
    });
    
    console.log('Sync response status:', syncResponse.status);
    console.log('Sync response headers:', Object.fromEntries(syncResponse.headers.entries()));
    
    // Get the raw text first to see what we're dealing with
    const rawText = await syncResponse.text();
    console.log('Raw response length:', rawText.length);
    console.log('Raw response (first 500 chars):', rawText.substring(0, 500));
    
    if (rawText.trim() === '') {
      console.log('❌ Empty response - this is the cause of "Unexpected end of JSON input"');
      return;
    }
    
    try {
      const syncData = JSON.parse(rawText);
      console.log('✅ Valid JSON response');
      console.log('Sync data:', JSON.stringify(syncData, null, 2));
    } catch (jsonError) {
      console.log('❌ JSON parsing failed:', jsonError.message);
      console.log('This confirms the "Unexpected end of JSON input" error');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testSyncEndpoint();
