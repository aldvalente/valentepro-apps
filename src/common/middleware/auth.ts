// Authorization middleware helpers
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UnauthorizedError, ForbiddenError } from '@/src/common/types';
import { UserRole } from '@prisma/client';

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new UnauthorizedError('Authentication required');
  }

  return {
    userId: (session.user as any).id,
    email: session.user.email!,
    role: (session.user as any).role as UserRole,
    user: session.user,
  };
}

export async function requireRole(allowedRoles: UserRole[]) {
  const auth = await requireAuth();

  if (!allowedRoles.includes(auth.role)) {
    throw new ForbiddenError('Insufficient permissions');
  }

  return auth;
}

export async function requireOwner() {
  const auth = await requireAuth();

  if (auth.role !== 'OWNER' && auth.role !== 'ADMIN') {
    throw new ForbiddenError('Owner role required');
  }

  return auth;
}

export async function requireSkipper() {
  const auth = await requireAuth();

  if (auth.role !== 'SKIPPER' && auth.role !== 'ADMIN') {
    throw new ForbiddenError('Skipper role required');
  }

  return auth;
}

export async function requireAdmin() {
  return await requireRole(['ADMIN']);
}

export async function getOptionalAuth() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return null;
    }

    return {
      userId: (session.user as any).id,
      email: session.user.email!,
      role: (session.user as any).role as UserRole,
      user: session.user,
    };
  } catch (error) {
    return null;
  }
}
