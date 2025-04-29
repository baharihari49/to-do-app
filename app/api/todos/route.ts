// app/api/todos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth'; // Updated import path
import { z } from 'zod';

// Type definitions to match the interface
type StatusType = 'pending' | 'in-progress' | 'completed';
type PriorityLevel = 'low' | 'medium' | 'high';

// Todo interface as specified
export interface Todo {
  id: number | string;
  title: string;
  description: string;
  status: StatusType;
  dueDate: string | null;
  startDate?: string | null;
  time?: string | null;
  priority: PriorityLevel;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    name: string;
    avatar?: string | null;
  };
}

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

// Function to format a todo from the database to match the Todo interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatTodo(dbTodo: any, userName: string, userAvatar?: string | null): Todo {
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
    
    // Get todos with pagination and include user data
    const dbTodos = await db.todo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { 
        updatedAt: 'desc' 
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
    
    // Format todos to match the Todo interface
    const todos = dbTodos.map(todo => {
      const userName = `${todo.user.firstName} ${todo.user.lastName}`.trim();
      return formatTodo(todo, userName || 'User', null);
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
    const newTodo = await db.todo.create({
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
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    // Format the created todo to match the Todo interface
    const userName = `${newTodo.user.firstName} ${newTodo.user.lastName}`.trim();
    const todo = formatTodo(newTodo, userName, null);
    
    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}