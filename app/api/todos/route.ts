// app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth'; // Updated import path
import { z } from 'zod';

// Validation schema for creating a todo
const createTodoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['pending', 'completed']).default('pending'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
});

// GET all todos (with pagination)
export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get pagination parameters from URL
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status') || undefined;
    const priority = url.searchParams.get('priority') || undefined;
    
    // Calculate offset
    const skip = (page - 1) * limit;
    
    // Build the where clause based on filters
    const where = {
      userId: currentUser.id,
      ...(status && { status }),
      ...(priority && { priority }),
    };
    
    // Get total count for pagination
    const totalCount = await db.todo.count({ where });
    
    // Get todos with pagination
    const todos = await db.todo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { 
        updatedAt: 'desc' 
      },
    });
    
    return NextResponse.json({
      todos,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit),
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create a new todo
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const result = createTodoSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.errors },
        { status: 400 }
      );
    }
    
    const { title, description, status, priority, dueDate, startDate, time } = result.data;
    
    // Create new todo
    const todo = await db.todo.create({
      data: {
        title,
        description: description || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        time: time || null,
        userId: currentUser.id,
      },
    });
    
    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}