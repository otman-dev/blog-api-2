import mongoose from 'mongoose';

declare global {
  var mongooseBlogContent: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
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

async function dbConnect() {
  if (!cached) {
    cached = global.mongooseBlogContent = { conn: null, promise: null };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.createConnection(MONGODB_URI, opts).asPromise();
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Connected to blog content database (otman-blog)');
  } catch (e) {
    cached.promise = null;
    console.error('❌ Failed to connect to blog content database:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
