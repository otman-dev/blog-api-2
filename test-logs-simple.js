const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLogsEndpointDirect() {
  console.log('Testing logs endpoint directly...');
  
  try {
    console.log('1. Testing all logs endpoint...');
    
    const response = await fetch('http://localhost:3000/api/cron/logs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Logs data:', JSON.stringify(data, null, 2));
      
      if (data.success && data.executions) {
        console.log(`\nFound ${data.executions.length} executions`);
        if (data.executions.length > 0) {
          const firstExecution = data.executions[0];
          console.log('First execution sample:', {
            status: firstExecution.status,
            startTime: firstExecution.startTime,
            duration: firstExecution.duration,
            httpStatus: firstExecution.httpStatus
          });
        }
      }
    } else {
      const errorText = await response.text();
      console.error('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Error testing logs:', error);
  }
}

console.log('Note: Make sure the Next.js server is running on localhost:3000');
testLogsEndpointDirect();
