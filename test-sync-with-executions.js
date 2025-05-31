const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testSyncEndpoint() {
  console.log('Testing improved sync functionality...');
  
  try {
    console.log('1. Calling sync endpoint...');
    
    const response = await fetch('http://localhost:3000/api/cron/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Sync request failed:', response.status, response.statusText);
      return;
    }
    
    const syncResult = await response.json();
    console.log('Sync result:', JSON.stringify(syncResult, null, 2));
    
    console.log('\n2. Checking statistics after sync...');
    
    const statsResponse = await fetch('http://localhost:3000/api/cron/jobs/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('Updated statistics:', JSON.stringify(stats, null, 2));
    } else {
      console.error('Stats request failed:', statsResponse.status, statsResponse.statusText);
    }
    
  } catch (error) {
    console.error('Error testing sync:', error);
  }
}

console.log('Note: Make sure the Next.js server is running on localhost:3000');
console.log('Run: npm run dev');
console.log('Then run this script to test the sync functionality\n');

testSyncEndpoint();
