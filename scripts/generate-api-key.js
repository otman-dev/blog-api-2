/**
 * Script to generate a secure API key for cron job authentication
 * Run this script using: node scripts/generate-api-key.js
 */

const crypto = require('crypto');

// Generate a random 32-byte hex string
const apiKey = crypto.randomBytes(32).toString('hex');

console.log('\n===== SECURE API KEY =====');
console.log(apiKey);
console.log('=========================\n');

console.log('Instructions:');
console.log('1. Add this key to your Vercel environment variables as CRON_API_KEY');
console.log('2. Update your cron.org job to use the new endpoint:');
console.log('   - URL: https://your-app.vercel.app/api/cron-secure?key=YOUR_KEY_HERE');
console.log('   - OR add header: x-api-key: YOUR_KEY_HERE\n');
