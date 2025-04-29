import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';

// Type definitions to match the interface
type StatusType = 'pending' | 'completed';
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

// GET /api/todos/all
// Fetch all todos for the current user without pagination
// This is specifically for the calendar view which will display based on startDate
export async function GET() {
  try {
    // Get the current user using the shared function
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch all todos for the user with user information, ordered by startDate first, then dueDate
    const todos = await db.todo.findMany({
      where: {
        userId: currentUser.id,
      },
      orderBy: [
        { startDate: 'asc' }, // Primary sort on startDate
        { dueDate: 'asc' }    // Secondary sort on dueDate
      ],
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    
    // Transform the todos to match the expected format with the createdBy field
    const formattedTodos: Todo[] = todos.map(todo => {
      const userName = `${todo.user.firstName} ${todo.user.lastName}`.trim();
      
      return {
        id: todo.id,
        title: todo.title,
        description: todo.description || '',
        status: todo.status as StatusType,
        dueDate: todo.dueDate ? todo.dueDate.toISOString() : null,
        startDate: todo.startDate ? todo.startDate.toISOString() : null,
        time: todo.time || null,
        priority: todo.priority as PriorityLevel,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt.toISOString(),
        createdBy: {
          name: userName,
          avatar: null // Add avatar if available in your user model
        }
      };
    });
    
    return NextResponse.json(formattedTodos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}