// Debug script to test authentication
const { headers } = require('next/headers');

// Test if the auth token is being passed correctly
console.log('Testing authentication flow...');

// Check if JWT_SECRET is set
console.log('JWT_SECRET available:', !!process.env.JWT_SECRET);

// Test token creation and verification
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

try {
  // Create a test token
  const testToken = jwt.sign(
    { userId: 'test', email: 'test@test.com', role: 'admin' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  console.log('Test token created:', testToken.substring(0, 50) + '...');
  
  // Verify the token
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('Token verification successful:', decoded);
  
} catch (error) {
  console.error('JWT error:', error);
}
