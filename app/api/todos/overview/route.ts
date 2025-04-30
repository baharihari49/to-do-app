// app/api/todos/all/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ambil semua todo untuk user yang sedang login, tanpa paginasi
    const todos = await db.todo.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Format todos sesuai kebutuhan frontend
    const formattedTodos = todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      description: todo.description || '',
      status: todo.status,
      priority: todo.priority,
      dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
      startDate: todo.startDate ? todo.startDate.toISOString() : null,
      time: todo.time || null,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
      createdBy: {
        name: `${todo.user.firstName || ''} ${todo.user.lastName || ''}`.trim(),
      },
    }));

    return NextResponse.json(formattedTodos);
  } catch (error) {
    console.error('Error fetching all todos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}