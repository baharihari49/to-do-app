// lib/server-auth.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

// Get the current user from the JWT token in the cookie
// This function is used in server components and API routes
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = cookies();
  const token = (await cookieStore).get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'default-secret-key-change-in-production'
    );
    
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload.id) {
      return null;
    }
    
    // Get the latest user data from the database
    const user = await db.user.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });
    
    if (!user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}