// app/api/todos/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';
import { z } from 'zod';

// Validation schema for batch operations
const batchOperationSchema = z.object({
  action: z.enum(['complete', 'delete']),
  ids: z.array(z.string()),
});

// POST batch operation (complete or delete multiple todos)
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
    
    // Verify that all todos belong to the current user
    const todosCount = await db.todo.count({
      where: {
        id: { in: ids },
        userId: currentUser.id,
      },
    });
    
    if (todosCount !== ids.length) {
      return NextResponse.json(
        { error: 'One or more todos not found or not accessible' },
        { status: 404 }
      );
    }
    
    // Perform the batch operation
    if (action === 'complete') {
      // Mark todos as completed
      await db.todo.updateMany({
        where: {
          id: { in: ids },
          userId: currentUser.id,
        },
        data: {
          status: 'completed',
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
          userId: currentUser.id,
        },
      });
      
      return NextResponse.json(
        { message: `${ids.length} todos deleted` },
        { status: 200 }
      );
    }
    
    // Should never reach here due to validation
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error performing batch operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}