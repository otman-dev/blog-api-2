import mongoose from 'mongoose';

const MONGODB_CRON_URI = process.env.MONGODB_CRON_URI;

if (!MONGODB_CRON_URI) {
  throw new Error('Please define the MONGODB_CRON_URI environment variable inside .env');
}

interface CachedConnection {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

declare global {
  var mongooseCron: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongooseCron || {
  conn: null,
  promise: null
};

if (!global.mongooseCron) {
  global.mongooseCron = cached;
}

export async function connectToCronDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.createConnection(MONGODB_CRON_URI!, opts).asPromise();
  }

  try {
    cached.conn = await cached.promise;
    console.log('Connected to MongoDB Cron Database');
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default connectToCronDB;
