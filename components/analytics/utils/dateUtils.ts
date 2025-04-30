

// src/features/analytics/utils/dateUtils.ts
import { TimeRange } from '../types';
import { Todo } from '@/Types/Types';

export const formatDateForGrouping = (date: string, timeRange: TimeRange): string => {
  const dateObj = new Date(date);
  if (timeRange === '7d') {
    // Return day name (Mon, Tue, etc.)
    return dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  } else if (timeRange === '30d') {
    // For 30 days, calculate which week
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const daysSinceStart = Math.floor((dateObj.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(daysSinceStart / 7) + 1;
    return `Week ${weekNumber}`;
  } else {
    // Return month name (Jan, Feb, etc.)
    return dateObj.toLocaleDateString('en-US', { month: 'short' });
  }
};

export const getCompletionTime = (todo: Todo): string => {
  if (!todo.startDate || !todo.updatedAt || todo.status !== 'completed') {
    return 'Pending';
  }
  
  const startDate = new Date(todo.startDate);
  const completedDate = new Date(todo.updatedAt);
  const diffTime = Math.abs(completedDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 1) return 'Within 1 day';
  if (diffDays <= 2) return '1-2 days';
  if (diffDays <= 7) return '3-7 days';
  return 'Over 7 days';
};

export const formatTimeRange = (range: TimeRange): string => {
  switch (range) {
    case '7d': return 'Last 7 Days';
    case '30d': return 'Last 30 Days';
    case '90d': return 'Last 3 Months';
    case '1y': return 'Last Year';
    default: return 'Last 7 Days';
  }
};
