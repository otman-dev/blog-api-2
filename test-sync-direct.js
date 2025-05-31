#!/usr/bin/env node

/**
 * Direct test of sync endpoint without authentication
 */

async function testSyncDirect() {
  console.log('Testing sync endpoint directly...');
  
  try {
    console.log('Making direct call to sync endpoint...');
    
    const response = await fetch('http://localhost:3000/api/cron/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token' // This will fail auth but we can see the response format
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    // Get the raw response
    const rawText = await response.text();
    console.log('Raw response length:', rawText.length);
    console.log('Raw response:', rawText);
    
    if (rawText.trim() === '') {
      console.log('❌ FOUND THE ISSUE: Empty response body');
      console.log('This is what causes "Unexpected end of JSON input"');
    } else {
      try {
        const data = JSON.parse(rawText);
        console.log('✅ Valid JSON response');
        console.log('Parsed data:', data);
      } catch (jsonError) {
        console.log('❌ JSON parsing error:', jsonError.message);
        console.log('This confirms the issue is malformed JSON');
      }
    }
    
  } catch (error) {
    console.error('Network error:', error.message);
  }
}

testSyncDirect();
