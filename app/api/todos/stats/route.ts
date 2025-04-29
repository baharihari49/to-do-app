// app/api/todos/stats/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/server-auth';

// GET todo statistics
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get total count
    const totalTodos = await db.todo.count({
      where: {
        userId: currentUser.id,
      },
    });
    
    // Get completed count
    const completedTodos = await db.todo.count({
      where: {
        userId: currentUser.id,
        status: 'completed',
      },
    });
    
    // Get overdue count (todos with due date in the past and not completed)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTodos = await db.todo.count({
      where: {
        userId: currentUser.id,
        status: 'pending',
        dueDate: {
          lt: today,
          not: null,
        },
      },
    });
    
    // Get upcoming todos (due within the next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const upcomingTodos = await db.todo.count({
      where: {
        userId: currentUser.id,
        status: 'pending',
        dueDate: {
          gte: today,
          lt: nextWeek,
          not: null,
        },
      },
    });
    
    // Calculate statistics
    const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;
    
    // Get priority distribution
    const highPriorityCount = await db.todo.count({
      where: {
        userId: currentUser.id,
        priority: 'high',
      },
    });
    
    const mediumPriorityCount = await db.todo.count({
      where: {
        userId: currentUser.id,
        priority: 'medium',
      },
    });
    
    const lowPriorityCount = await db.todo.count({
      where: {
        userId: currentUser.id,
        priority: 'low',
      },
    });
    
    return NextResponse.json({
      totalTodos,
      completedTodos,
      pendingTodos: totalTodos - completedTodos,
      overdueTodos,
      upcomingTodos,
      completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
      priorityDistribution: {
        high: highPriorityCount,
        medium: mediumPriorityCount,
        low: lowPriorityCount,
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching todo statistics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}