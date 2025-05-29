import mongoose from 'mongoose';

declare global {
  var mongooseBlogApi: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Use a different database name for blog-api automation state
const BLOG_API_DB_NAME = 'blog-api';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongooseBlogApi;

if (!cached) {
  cached = global.mongooseBlogApi = { conn: null, promise: null };
}

export async function connectToBlogApiDB() {
  if (!cached) {
    cached = global.mongooseBlogApi = { conn: null, promise: null };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: BLOG_API_DB_NAME, // Use the blog-api database
    };

    cached.promise = mongoose.createConnection(MONGODB_URI, opts).asPromise();
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Connected to blog-api database');
  } catch (e) {
    cached.promise = null;
    console.error('❌ Failed to connect to blog-api database:', e);
    throw e;
  }

  return cached.conn;
}

export default connectToBlogApiDB;
