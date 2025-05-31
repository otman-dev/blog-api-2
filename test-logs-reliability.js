#!/usr/bin/env node

/**
 * Test logs endpoint multiple times to check for intermittent issues
 */

async function testLogsReliability() {
  console.log('Testing logs endpoint reliability...');
  
  const testCount = 10;
  const results = [];
  
  for (let i = 1; i <= testCount; i++) {
    console.log(`\nTest ${i}/${testCount}:`);
    
    try {
      const startTime = Date.now();
      const response = await fetch('http://localhost:3000/api/cron/logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log(`✅ Success - ${data.executions?.length || 0} executions (${duration}ms)`);
          results.push({ success: true, executions: data.executions?.length || 0, duration });
        } else {
          console.log(`❌ API Error: ${data.error} (${duration}ms)`);
          results.push({ success: false, error: data.error, duration });
        }
      } else {
        console.log(`❌ HTTP Error: ${response.status} ${response.statusText} (${duration}ms)`);
        results.push({ success: false, error: `HTTP ${response.status}`, duration });
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
      results.push({ success: false, error: error.message, duration: 0 });
    }
    
    // Wait a bit between requests
    if (i < testCount) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Analyze results
  console.log('\n=== RESULTS ANALYSIS ===');
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const avgDuration = results.filter(r => r.duration > 0).reduce((sum, r) => sum + r.duration, 0) / results.filter(r => r.duration > 0).length;
  
  console.log(`Success Rate: ${successCount}/${testCount} (${(successCount/testCount*100).toFixed(1)}%)`);
  console.log(`Failure Rate: ${failureCount}/${testCount} (${(failureCount/testCount*100).toFixed(1)}%)`);
  console.log(`Average Duration: ${avgDuration.toFixed(0)}ms`);
  
  if (failureCount > 0) {
    console.log('\nFailure Details:');
    results.filter(r => !r.success).forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.error}`);
    });
  }
  
  // Recommendations
  console.log('\n=== RECOMMENDATIONS ===');
  if (successCount === testCount) {
    console.log('✅ Endpoint is reliable - issue might be in frontend');
  } else if (successCount > testCount * 0.8) {
    console.log('⚠️  Mostly reliable but some intermittent issues');
  } else {
    console.log('❌ Significant reliability issues detected');
  }
}

testLogsReliability().catch(console.error);
