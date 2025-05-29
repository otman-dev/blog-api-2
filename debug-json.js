// Load environment variables manually
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '.env.local');
  const envVars = fs.readFileSync(envPath, 'utf8');
  envVars.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (e) {
  console.log('No .env.local file found, using existing env vars');
}

const Groq = require('groq-sdk').default;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testJsonGeneration() {
  try {
    console.log('🔄 Testing API endpoint for auto-generation...');
    
    const response = await fetch('http://localhost:3001/api/auto-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate-now'
      })
    });
    
    const result = await response.json();
      if (response.ok) {
      console.log('\n✅ Success!');
      console.log('Full response:', result);
    } else {
      console.error('\n❌ API Error:', result);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testJsonGeneration();
