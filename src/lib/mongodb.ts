import mongoose from 'mongoose';
import dbConnect from './db/contentDb';

// This file is kept for backwards compatibility
// New code should use either:
// - import dbConnect from './db/contentDb'; // For blog content (otman-blog database)
// - import adminDbConnect from './db/adminDb'; // For auth/users (blog-api database)

declare global {
  var mongoose: {
    conn: mongoose.Mongoose | null;
    promise: Promise<mongoose.Mongoose> | null;
  };
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// This function now uses the new contentDb connection
// and is maintained for backwards compatibility
async function mongodbConnect() {
  console.log('⚠️ Warning: Using deprecated mongodb.ts, consider switching to db/contentDb.ts');
  return dbConnect();
}

export default mongodbConnect;
