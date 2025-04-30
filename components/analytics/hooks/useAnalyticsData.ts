// src/features/analytics/hooks/useAnalyticsData.ts
import { useMemo } from 'react';
import { Todo, PriorityLevel } from '@/Types/Types';
import { 
  TimeRange, 
  ActivityData, 
  CompletionRateData, 
  PriorityDistributionData,
  CompletionTimeData 
} from '../types';
import { getCompletionTime } from '../utils/dateUtils';

export const useAnalyticsData = (
  allTodos: Todo[],
  overviewStats: { 
    completedCount: number;
    totalCount: number;
    overdueCount: number;
  },
  timeRange: TimeRange,
  isOverdue: (dateString: string) => boolean
) => {
  // Get startDate based on timeRange
  const getStartDate = (): Date => {
    const now = new Date();
    const result = new Date(now);
    
    switch (timeRange) {
      case '7d':
        result.setDate(now.getDate() - 7);
        break;
      case '30d':
        result.setDate(now.getDate() - 30);
        break;
      case '90d':
        result.setDate(now.getDate() - 90);
        break;
      case '1y':
        result.setFullYear(now.getFullYear() - 1);
        break;
      default:
        result.setDate(now.getDate() - 7);
    }
    return result;
  };

  // Activity Data
  const activityData = useMemo((): ActivityData => {
    if (!allTodos || allTodos.length === 0) return [];
    
    const startDate = getStartDate();
    const endDate = new Date();
    
    // Filter todos created after start date
    const filteredTodos = allTodos.filter(todo => {
      const createdDate = new Date(todo.createdAt || new Date());
      return createdDate >= startDate && createdDate <= endDate;
    });
    
    // Initialize groupedData based on timeRange
    const groupedData: Record<string, { created: number; completed: number }> = {};
    
    if (timeRange === '7d') {
      // Last 7 days
      const dayLabels: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dayLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      }
      
      dayLabels.forEach(day => {
        groupedData[day] = { created: 0, completed: 0 };
      });
    } else if (timeRange === '30d') {
      // Last 30 days, grouped by week
      for (let i = 0; i < 5; i++) {
        const weekLabel = `Week ${i+1}`;
        groupedData[weekLabel] = { created: 0, completed: 0 };
      }
    } else {
      // For longer periods, use months
      const monthSet = new Set<string>();
      
      const current = new Date(startDate);
      while (current <= endDate) {
        const monthName = current.toLocaleDateString('en-US', { month: 'short' });
        monthSet.add(monthName);
        current.setMonth(current.getMonth() + 1);
      }
      
      // Sort months chronologically
      const months = [...monthSet].sort((a, b) => {
        const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
      });
      
      months.forEach(month => {
        groupedData[month] = { created: 0, completed: 0 };
      });
    }
    
    // Count created and completed todos
    filteredTodos.forEach(todo => {
      if (!todo.createdAt) return;
      
      // Count created todos
      const createdDate = new Date(todo.createdAt);
      let dateKey: string;
      
      if (timeRange === '7d') {
        dateKey = createdDate.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timeRange === '30d') {
        const daysSinceStart = Math.floor((createdDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysSinceStart / 7) + 1;
        dateKey = `Week ${weekNumber}`;
      } else {
        dateKey = createdDate.toLocaleDateString('en-US', { month: 'short' });
      }
      
      if (groupedData[dateKey]) {
        groupedData[dateKey].created += 1;
      }
      
      // Count completed todos
      if (todo.status === 'completed' && todo.updatedAt) {
        const completedDate = new Date(todo.updatedAt);
        let completedDateKey: string;
        
        if (timeRange === '7d') {
          completedDateKey = completedDate.toLocaleDateString('en-US', { weekday: 'short' });
        } else if (timeRange === '30d') {
          const daysSinceStart = Math.floor((completedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const weekNumber = Math.floor(daysSinceStart / 7) + 1;
          completedDateKey = `Week ${weekNumber}`;
        } else {
          completedDateKey = completedDate.toLocaleDateString('en-US', { month: 'short' });
        }
        
        if (groupedData[completedDateKey]) {
          groupedData[completedDateKey].completed += 1;
        }
      }
    });
    
    // Convert to array format for charts
    return Object.entries(groupedData).map(([key, value]) => ({
      label: key,
      created: value.created,
      completed: value.completed
    }));
  }, [allTodos, timeRange]);

  // Completion rate data
  const completionRateData = useMemo((): CompletionRateData => {
    const completed = overviewStats.completedCount;
    const pending = overviewStats.totalCount - completed;
    
    return [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#6b7280' },
    ];
  }, [overviewStats]);

  // Priority distribution data
  const priorityDistributionData = useMemo((): PriorityDistributionData => {
    if (!allTodos || allTodos.length === 0) {
      return [
        { name: 'High', value: 0, color: '#ef4444' },
        { name: 'Medium', value: 0, color: '#f59e0b' },
        { name: 'Low', value: 0, color: '#6b7280' },
      ];
    }
    
    const priorities: Record<PriorityLevel, number> = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    allTodos.forEach(todo => {
      if (todo.priority in priorities) {
        priorities[todo.priority as PriorityLevel]++;
      }
    });
    
    return [
      { name: 'High', value: priorities.high, color: '#ef4444' },
      { name: 'Medium', value: priorities.medium, color: '#f59e0b' },
      { name: 'Low', value: priorities.low, color: '#6b7280' },
    ];
  }, [allTodos]);

  // Completion time data
  const completionTimeData = useMemo((): CompletionTimeData => {
    if (!allTodos || allTodos.length === 0) {
      return [
        { day: 'Within 1 day', tasks: 0 },
        { day: '1-2 days', tasks: 0 },
        { day: '3-7 days', tasks: 0 },
        { day: 'Over 7 days', tasks: 0 },
        { day: 'Overdue', tasks: 0 },
      ];
    }
    
    const completionTimes: Record<string, number> = {
      'Within 1 day': 0,
      '1-2 days': 0,
      '3-7 days': 0,
      'Over 7 days': 0,
      'Overdue': 0,
    };
    
    allTodos.forEach(todo => {
      if (todo.status !== 'completed' && isOverdue(todo.dueDate)) {
        completionTimes['Overdue'] += 1;
      } else if (todo.status === 'completed') {
        const timeCategory = getCompletionTime(todo);
        if (timeCategory in completionTimes) {
          completionTimes[timeCategory] += 1;
        }
      }
    });
    
    return Object.entries(completionTimes).map(([day, tasks]) => ({
      day,
      tasks
    }));
  }, [allTodos, isOverdue]);

  // Average completion time
  const averageCompletionTime = useMemo((): number => {
    if (!allTodos || allTodos.length === 0) return 0;
    
    const completedTodos = allTodos.filter(todo => 
      todo.status === 'completed' && todo.startDate && todo.updatedAt
    );
    
    if (completedTodos.length === 0) return 0;
    
    const totalDays = completedTodos.reduce((sum, todo) => {
      const startDate = new Date(todo.startDate || '');
      const completedDate = new Date(todo.updatedAt || '');
      const diffTime = Math.abs(completedDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return parseFloat((totalDays / completedTodos.length).toFixed(1));
  }, [allTodos]);

  return {
    activityData,
    completionRateData,
    priorityDistributionData,
    completionTimeData,
    averageCompletionTime
  };
};