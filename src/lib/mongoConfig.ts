import mongoose from 'mongoose';

declare global {
  // For blog content database
  var mongooseBlogContent: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
  
  // For admin/users database
  var mongooseAdminUsers: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

const MONGODB_CONTENT_URI = process.env.MONGODB_URI!;
const MONGODB_ADMIN_URI = process.env.MONGODB_ADMIN_URI || process.env.MONGODB_URI!;

if (!MONGODB_CONTENT_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!MONGODB_ADMIN_URI) {
  console.warn('MONGODB_ADMIN_URI not defined, falling back to MONGODB_URI');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongooseBlogContent;

if (!cached) {
  cached = global.mongooseBlogContent = { conn: null, promise: null };
}

// This is maintained for backward compatibility
export async function connectToBlogApiDB() {
  // Forward to adminDbConnect() in the new structure
  return import('./db/adminDb').then(module => module.default());
}

// Connect to the content database for blogs
async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.createConnection(MONGODB_CONTENT_URI, opts).asPromise();
  }

  try {
    cached.conn = await cached.promise;    console.log('✅ Connected to blog content database (otman-blog)');
  } catch (e) {
    cached.promise = null;
    console.error('❌ Failed to connect to blog content database:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
