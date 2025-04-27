// app/api/todos/stats/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';

// Define types for our query results
type RawCountResult = {
  status?: string;
  priority?: string;
  count: bigint;
};

// Helper function to convert BigInt to Number with proper typing
const processBigIntValues = <T>(obj: T): unknown => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => processBigIntValues(item));
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      result[key] = processBigIntValues((obj as Record<string, unknown>)[key]);
    }
    return result;
  }

  return obj;
};

// GET todo statistics for the current user
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get counts by status
    const rawStatusCounts = await db.$queryRaw<RawCountResult[]>`
      SELECT 
        status, 
        COUNT(*) as count 
      FROM 
        Todo 
      WHERE 
        userId = ${currentUser.id} 
      GROUP BY 
        status
    `;
    
    // Get counts by priority
    const rawPriorityCounts = await db.$queryRaw<RawCountResult[]>`
      SELECT 
        priority, 
        COUNT(*) as count 
      FROM 
        Todo 
      WHERE 
        userId = ${currentUser.id} 
      GROUP BY 
        priority
    `;
    
    // Convert BigInt to Number
    const statusCounts = processBigIntValues(rawStatusCounts);
    const priorityCounts = processBigIntValues(rawPriorityCounts);
    
    // Get overdue todos count
    const overdueTodos = await db.todo.count({
      where: {
        userId: currentUser.id,
        status: 'pending',
        dueDate: {
          lt: new Date()
        }
      }
    });
    
    // Get todos due today count
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const dueTodayTodos = await db.todo.count({
      where: {
        userId: currentUser.id,
        status: 'pending',
        dueDate: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
    
    // Get recently completed todos (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlyCompletedCount = await db.todo.count({
      where: {
        userId: currentUser.id,
        status: 'completed',
        updatedAt: {
          gte: sevenDaysAgo
        }
      }
    });
    
    // Calculate completion rate (if there are any todos)
    const totalTodos = await db.todo.count({
      where: {
        userId: currentUser.id
      }
    });
    
    const completedTodos = await db.todo.count({
      where: {
        userId: currentUser.id,
        status: 'completed'
      }
    });
    
    const completionRate = totalTodos > 0 
      ? Math.round((completedTodos / totalTodos) * 100) 
      : 0;
    
    return NextResponse.json({
      statusCounts,
      priorityCounts,
      overdueTodos,
      dueTodayTodos,
      recentlyCompletedCount,
      totalTodos,
      completedTodos,
      completionRate,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching todo statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}