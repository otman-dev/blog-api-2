import mongoose from 'mongoose';

declare global {
  var mongooseAdminUsers: {
    conn: mongoose.Connection | null;
    promise: Promise<mongoose.Connection> | null;
  };
}

const MONGODB_ADMIN_URI = process.env.MONGODB_ADMIN_URI || 'mongodb://rasmus:wordpiss@adro.ddns.net:27017/blog-api?authSource=admin';

if (!MONGODB_ADMIN_URI) {
  console.warn('MONGODB_ADMIN_URI not defined, using default connection');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongooseAdminUsers;

if (!cached) {
  cached = global.mongooseAdminUsers = { conn: null, promise: null };
}

async function adminDbConnect() {
  if (!cached) {
    cached = global.mongooseAdminUsers = { conn: null, promise: null };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.createConnection(MONGODB_ADMIN_URI, opts).asPromise();
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ Connected to admin users database (blog-api)');
  } catch (e) {
    cached.promise = null;
    console.error('❌ Failed to connect to admin users database:', e);
    throw e;
  }

  return cached.conn;
}

export default adminDbConnect;
