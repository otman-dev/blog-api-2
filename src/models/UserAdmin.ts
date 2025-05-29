import mongoose, { Document, Schema } from 'mongoose';
import adminDbConnect from '@/lib/db/adminDb';

export interface IUser extends Document {
  email: string;
  password: string;
  role: 'admin' | 'user';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },  name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

// Create model in the admin database
const getUser = async () => {
  const connection = await adminDbConnect();
  return connection.models.User || connection.model<IUser>('User', UserSchema);
};

export default getUser;
