import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server-auth';
import { db } from '@/lib/db';
import { compare, hash } from 'bcrypt';
import { z } from 'zod';

// Validation schemas
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  description: z.string().optional()
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8)
});

// --- GET /api/profile --- //
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: currentUser.id },
      include: { todos: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tasksCreated = user.todos.length;
    const tasksCompleted = user.todos.filter(todo => todo.status === 'completed').length;
    const completionRate = tasksCreated > 0 ? (tasksCompleted / tasksCreated) * 100 : 0;

    return NextResponse.json({
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`,
        description: user.description || '',
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.updatedAt.toISOString(), // Simpan updatedAt jadi lastLogin sementara
        stats: {
          tasksCreated,
          tasksCompleted,
          completionRate: Math.round(completionRate),
        },
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// --- PATCH /api/profile --- //
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check apakah update password atau profile
    if (body.currentPassword && body.newPassword) {
      // Update password
      const result = updatePasswordSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Invalid password input', details: result.error.errors }, { status: 400 });
      }

      const user = await db.user.findUnique({ where: { id: currentUser.id } });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // ✅ Pakai compare dari bcrypt yang sudah di-import
      const passwordMatch = await compare(result.data.currentPassword, user.password);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }

      const hashedPassword = await hash(result.data.newPassword, 10);

      await db.user.update({
        where: { id: currentUser.id },
        data: { password: hashedPassword }
      });

      return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

    } else {
      // Update profile (name/email/bio)
      const result = updateProfileSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'Invalid profile input', details: result.error.errors }, { status: 400 });
      }

      const { name, email, description } = result.data;

      // Pisahkan nama depan dan nama belakang
      const [firstName, ...lastNameParts] = name?.split(' ') || [];
      const lastName = lastNameParts.join(' ');

      await db.user.update({
        where: { id: currentUser.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
          ...(email && { email }),
          ...(description !== undefined && { description }), // ✅ langsung masuk ke field description
        },
      });

      return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
    }

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// --- DELETE /api/profile --- //
export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await db.user.delete({
      where: { id: currentUser.id }
    });

    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
