import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeaders } from './auth';
import getUserModel from '@/models/UserAdmin';
import adminDbConnect from './db/adminDb';

export interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateRequest = async (request: NextRequest): Promise<AuthenticatedRequest | null> => {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeaders(authHeader);
    
    if (!token) {
      return null;
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }    // Connect to database and get user details
    await adminDbConnect();
    const User = await getUserModel();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return null;
    }

    return {
      user: {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const requireAuth = async (request: NextRequest): Promise<AuthenticatedRequest> => {
  const auth = await authenticateRequest(request);
  if (!auth) {
    throw new Error('Authentication required');
  }
  return auth;
};

export const requireAdmin = async (request: NextRequest): Promise<AuthenticatedRequest> => {
  const auth = await requireAuth(request);
  if (auth.user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return auth;
};
