// This file helps users understand JWT token issues after secret changes
console.log(`
🔧 JWT Secret Change Detected!

If you're getting 401 authentication errors after updating the JWT secret:

1. Clear your browser's localStorage:
   - Open DevTools (F12)
   - Go to Application/Storage tab
   - Click on Local Storage
   - Delete 'token' and 'user' entries
   
2. Re-login to get a new token with the updated secret

3. Or run this in your browser console:
   localStorage.removeItem('token');
   localStorage.removeItem('user');
   window.location.reload();

This is normal when JWT secrets are updated for security reasons.
`);
