// app/api/todos/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';
import { z } from 'zod';

// Validation schema for batch operations
const batchOperationSchema = z.object({
  action: z.enum(['complete', 'delete']),
  ids: z.array(z.string()).min(1, 'At least one ID is required'),
});

// Handle batch operations (mark multiple todos as complete or delete multiple todos)
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const result = batchOperationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }
    
    const { action, ids } = result.data;
    
    // Verify all todos belong to the current user
    const todos = await db.todo.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        userId: true,
      },
    });
    
    // Check if all requested todos exist
    if (todos.length !== ids.length) {
      return NextResponse.json(
        { error: 'One or more todos not found' },
        { status: 404 }
      );
    }
    
    // Check if all todos belong to the current user
    const unauthorized = todos.some(todo => todo.userId !== currentUser.id);
    if (unauthorized) {
      return NextResponse.json(
        { error: 'You do not have permission to modify one or more of these todos' },
        { status: 403 }
      );
    }
    
    // Perform the requested action
    if (action === 'complete') {
      // Mark todos as completed
      await db.todo.updateMany({
        where: {
          id: { in: ids },
        },
        data: {
          status: 'completed',
          updatedAt: new Date(),
        },
      });
      
      return NextResponse.json(
        { message: `${ids.length} todos marked as completed` },
        { status: 200 }
      );
    } else if (action === 'delete') {
      // Delete todos
      await db.todo.deleteMany({
        where: {
          id: { in: ids },
        },
      });
      
      return NextResponse.json(
        { message: `${ids.length} todos deleted successfully` },
        { status: 200 }
      );
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error performing batch operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}