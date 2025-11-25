// Auth Signup API
import { NextRequest } from 'next/server';
import { userService } from '@/src/modules/users/services/user.service';
import { handleError, successResponse } from '@/src/common/middleware/error-handler';
import { z } from 'zod';

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = signupSchema.parse(body);

    const user = await userService.createUser({
      name,
      email,
      password,
      role: 'USER',
    });

    return successResponse(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        message: 'Account created successfully',
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}
