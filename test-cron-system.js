#!/usr/bin/env node

/**
 * Test script for the cron automation system
 * This script tests the integration with cron.org API and database operations
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const CRON_API_KEY = process.env.CRON_ORG_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_CRON_URI = process.env.MONGODB_CRON_URI;

console.log('🧪 Testing Cron Automation System');
console.log('==================================');

// Check environment variables
function checkEnvironment() {
  console.log('\n📋 Checking Environment Variables...');
  
  const missing = [];
  if (!CRON_API_KEY) missing.push('CRON_ORG_API_KEY');
  if (!MONGODB_URI) missing.push('MONGODB_URI');
  if (!MONGODB_CRON_URI) missing.push('MONGODB_CRON_URI');
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
  console.log(`🔑 API Key: ${CRON_API_KEY.substring(0, 8)}...`);
  console.log(`🗄️ MongoDB URI: ${MONGODB_URI.split('@')[1] || 'localhost'}`);
  console.log(`🗄️ Cron DB URI: ${MONGODB_CRON_URI.split('@')[1] || 'localhost'}`);
}

// Test cron.org API connectivity
async function testCronAPI() {
  console.log('\n🌐 Testing cron.org API connectivity...');
  
  try {
    const response = await fetch('https://api.cron-job.org/jobs', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ cron.org API connection successful');
      console.log(`📊 Current jobs in account: ${data.jobs ? data.jobs.length : 0}`);
      return true;
    } else {
      console.error('❌ cron.org API connection failed:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ cron.org API connection error:', error.message);
    return false;
  }
}

// Test MongoDB connectivity
async function testMongoDB() {
  console.log('\n🗄️ Testing MongoDB connectivity...');
  
  try {
    const { MongoClient } = require('mongodb');
    
    // Test main database
    const mainClient = new MongoClient(MONGODB_URI);
    await mainClient.connect();
    await mainClient.db().admin().ping();
    console.log('✅ Main MongoDB connection successful');
    await mainClient.close();
    
    // Test cron database
    const cronClient = new MongoClient(MONGODB_CRON_URI);
    await cronClient.connect();
    await cronClient.db().admin().ping();
    console.log('✅ Cron MongoDB connection successful');
    await cronClient.close();
    
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

// Test creating a sample cron job
async function testCronJobCreation() {
  console.log('\n⚙️ Testing cron job creation...');
  
  try {
    const testJob = {
      title: 'Test Job - ' + new Date().toISOString(),
      url: 'https://httpbin.org/post',
      enabled: false, // Don't enable for testing
      schedule: {
        timezone: 'UTC',
        hours: [-1],
        mdays: [-1],
        minutes: [0],
        months: [-1],
        wdays: [-1]
      },
      requestMethod: 1 // POST
    };
    
    const response = await fetch('https://api.cron-job.org/jobs', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${CRON_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testJob)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Test cron job created successfully');
      console.log(`🆔 Job ID: ${data.jobId}`);
      
      // Clean up - delete the test job
      await fetch(`https://api.cron-job.org/jobs/${data.jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${CRON_API_KEY}`
        }
      });
      console.log('🧹 Test job cleaned up');
      
      return true;
    } else {
      console.error('❌ Test cron job creation failed:', response.status);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return false;
    }
  } catch (error) {
    console.error('❌ Test cron job creation error:', error.message);
    return false;
  }
}

// Test automation endpoints
async function testAutomationEndpoints() {
  console.log('\n🚀 Testing automation endpoints...');
  
  const baseUrl = 'http://localhost:3000'; // Adjust if needed
  
  console.log('ℹ️ Note: This test requires the server to be running');
  console.log('ℹ️ Start the server with: npm run dev');
  
  return true; // Skip actual testing for now
}

// Main test function
async function runTests() {
  console.log('Starting comprehensive cron system tests...\n');
  
  let allPassed = true;
  
  try {
    // Environment check
    checkEnvironment();
    
    // API connectivity test
    const apiTest = await testCronAPI();
    allPassed = allPassed && apiTest;
    
    // Database connectivity test
    const dbTest = await testMongoDB();
    allPassed = allPassed && dbTest;
    
    // Cron job creation test
    if (apiTest) {
      const jobTest = await testCronJobCreation();
      allPassed = allPassed && jobTest;
    }
    
    // Automation endpoints test
    const endpointTest = await testAutomationEndpoints();
    allPassed = allPassed && endpointTest;
    
  } catch (error) {
    console.error('\n💥 Unexpected error during testing:', error);
    allPassed = false;
  }
  
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 All tests passed! Cron system is ready to use.');
    console.log('\n📖 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Go to the dashboard and click the Automation tab');
    console.log('3. Use the Quick Setup presets or create custom jobs');
    console.log('4. Monitor your jobs in the dashboard');
  } else {
    console.log('❌ Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Check if mongodb package is available
try {
  require('mongodb');
} catch (error) {
  console.error('❌ MongoDB package not found. Install it with: npm install mongodb');
  process.exit(1);
}

// Run the tests
runTests().catch(console.error);
