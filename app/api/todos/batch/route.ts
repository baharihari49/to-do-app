// app/api/todos/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';
import { z } from 'zod';

// Validation schema for batch operations
const batchOperationSchema = z.object({
  action: z.enum(['complete', 'delete']),
  ids: z.array(z.string()), // Terima string UUID
});

// POST handler
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    console.log("Received batch request:", body);
    console.log("Current user:", currentUser.id);
    
    // Validate input
    const result = batchOperationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }
    
    const { action, ids } = result.data;
    console.log(`Attempting to ${action} todos with IDs:`, ids);
    
    // Tambahkan log untuk debug: Cek apakah todo dengan ID tersebut ada
    const existingTodos = await db.todo.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        userId: true,
      }
    });
    
    console.log("Found todos:", existingTodos);
    
    // Cek todos yang ditemukan vs todos yang diminta
    const notFound = ids.filter(id => !existingTodos.some(todo => todo.id === id));
    if (notFound.length > 0) {
      console.log("These todos were not found:", notFound);
      return NextResponse.json(
        { error: `Todos with IDs ${notFound.join(', ')} not found` },
        { status: 404 }
      );
    }
    
    // Cek todos yang bukan milik user saat ini
    const notOwned = existingTodos.filter(todo => todo.userId !== currentUser.id);
    if (notOwned.length > 0) {
      console.log("These todos don't belong to current user:", notOwned);
      return NextResponse.json(
        { error: `You don't have permission to modify some of these todos` },
        { status: 403 }
      );
    }
    
    // Perform the batch operation
    if (action === 'complete') {
      // Mark todos as completed
      const result = await db.todo.updateMany({
        where: {
          id: { in: ids },
          userId: currentUser.id,
        },
        data: {
          status: 'completed',
        },
      });
      
      console.log("Update result:", result);
      
      return NextResponse.json(
        { message: `${result.count} todos marked as completed` },
        { status: 200 }
      );
    } else if (action === 'delete') {
      // Delete todos
      const result = await db.todo.deleteMany({
        where: {
          id: { in: ids },
          userId: currentUser.id,
        },
      });
      
      console.log("Delete result:", result);
      
      return NextResponse.json(
        { message: `${result.count} todos deleted` },
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
    return NextResponse.json({ 
      error: 'Internal server error',
      details: (error as Error).message 
    }, { status: 500 });
  }
}

// Tambahkan ini untuk menghindari error "Method Not Allowed"
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}