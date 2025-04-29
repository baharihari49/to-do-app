// app/api/todos/[id]/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';
import { z } from 'zod';
import { Todo, StatusType, PriorityLevel } from '@/Types/Types';



// Todo interface as specified

// Function to format todo to match the Todo interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTodo(dbTodo: any, userName: string, userAvatar?: string ): Todo {
  return {
    id: dbTodo.id,
    title: dbTodo.title,
    description: dbTodo.description || '',
    status: dbTodo.status as StatusType,
    priority: dbTodo.priority as PriorityLevel,
    dueDate: dbTodo.dueDate ? dbTodo.dueDate.toISOString() : null,
    startDate: dbTodo.startDate ? dbTodo.startDate.toISOString() : null,
    time: dbTodo.time || null,
    createdAt: dbTodo.createdAt.toISOString(),
    updatedAt: dbTodo.updatedAt.toISOString(),
    createdBy: {
      name: userName,
      avatar: userAvatar
    }
  };
}

// GET handler 
export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract id from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];

    // Fetch todo with user information
    const dbTodo = await db.todo.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!dbTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    // Format todo to match the Todo interface
    const userName = `${dbTodo.user.firstName} ${dbTodo.user.lastName}`.trim();
    const todo = formatTodo(dbTodo, userName, undefined);

    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Validation schema for updating todo
const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
});

// PATCH handler
export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract id from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const todoId = pathParts[pathParts.length - 1];
    
    // Check if todo exists and belongs to user
    const existingTodo = await db.todo.findUnique({
      where: {
        id: todoId,
        userId: currentUser.id,
      },
    });
    
    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = updateTodoSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }
    
    const { title, description, status, priority, dueDate, startDate, time } = result.data;
    
    // Update the todo
    const updatedDbTodo = await db.todo.update({
      where: { id: todoId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(time !== undefined && { time }),
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    // Format the updated todo
    const userName = `${updatedDbTodo.user.firstName} ${updatedDbTodo.user.lastName}`.trim();
    const todo = formatTodo(updatedDbTodo, userName, undefined);
    
    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler
export async function DELETE(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract id from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const todoId = pathParts[pathParts.length - 1];
    
    // Check if todo exists and belongs to user
    const existingTodo = await db.todo.findUnique({
      where: {
        id: todoId,
        userId: currentUser.id,
      },
    });
    
    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    // Delete the todo
    await db.todo.delete({
      where: { id: todoId },
    });
    
    return NextResponse.json({ message: 'Todo deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT handler
export async function PUT(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Extract id from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const todoId = pathParts[pathParts.length - 1];
    
    // Check if todo exists and belongs to user
    const existingTodo = await db.todo.findUnique({
      where: {
        id: todoId,
        userId: currentUser.id,
      },
    });
    
    if (!existingTodo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }
    
    // Parse and validate request body
    const body = await req.json();
    const requiredSchema = z.object({
      title: z.string().min(1, 'Title is required'),
      description: z.string().optional().nullable(),
      status: z.enum(['pending', 'completed']),
      priority: z.enum(['low', 'medium', 'high']),
      dueDate: z.string().optional().nullable(),
      startDate: z.string().optional().nullable(),
      time: z.string().optional().nullable(),
    });
    
    const result = requiredSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }
    
    const { title, description, status, priority, dueDate, startDate, time } = result.data;
    
    // Replace the todo with new data
    const updatedDbTodo = await db.todo.update({
      where: { id: todoId },
      data: {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        time: time || null,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    // Format the updated todo
    const userName = `${updatedDbTodo.user.firstName} ${updatedDbTodo.user.lastName}`.trim();
    const todo = formatTodo(updatedDbTodo, userName, undefined);
    
    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    console.error('Error replacing todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}