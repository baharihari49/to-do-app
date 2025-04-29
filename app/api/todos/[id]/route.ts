// app/api/todos/[id]/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';
import { z } from 'zod';

// GET handler with minimal signature
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

    const todo = await db.todo.findUnique({
      where: {
        id,
        userId: currentUser.id,
      },
    });

    if (!todo) {
      return NextResponse.json({ error: 'Todo not found' }, { status: 404 });
    }

    return NextResponse.json({ todo }, { status: 200 });
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Other handlers with validation schema
const updateTodoSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['pending', 'completed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
});

// PATCH handler - minimal signature
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
    const updatedTodo = await db.todo.update({
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
    });
    
    return NextResponse.json({ todo: updatedTodo }, { status: 200 });
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE handler - minimal signature
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

// PUT handler - minimal signature
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
    const updatedTodo = await db.todo.update({
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
    });
    
    return NextResponse.json({ todo: updatedTodo }, { status: 200 });
  } catch (error) {
    console.error('Error replacing todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}