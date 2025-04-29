'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { Todo, PriorityLevel } from '@/Types/Types';
import { formatDate, isOverdue, getPriorityColor } from '@/utils/todoHelpers';
import { useTodos } from '@/hooks/useTodos';

// Helper function to get date parts in the specified timezone
function getDatePartsInTimeZone(dateString: string | Date, timeZone = 'Asia/Jakarta') {
  if (!dateString) return { year: new Date().getFullYear(), month: new Date().getMonth(), day: new Date().getDate() };
  
  try {
    // Create a date object
    const date = new Date(dateString);
    
    // Use DateTimeFormat to get the correct date in the specified timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    
    // Format the date to get parts in the specified timezone
    const formattedDate = formatter.format(date);
    const [month, day, year] = formattedDate.split('/').map(Number);
    
    return { year, month: month - 1, day }; // Month is 0-indexed in JavaScript Date
  } catch (e) {
    console.error("Error parsing date:", e);
    // Return current date as fallback
    return { 
      year: new Date().getFullYear(), 
      month: new Date().getMonth(), 
      day: new Date().getDate() 
    };
  }
}

// Special hook for calendar view that fetches ALL todos without pagination
export function useCalendarTodos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodoStatus,
    markSelectedAsCompleted,
    deleteSelected,
    setTodoStatus,
  } = useTodos();

  // Calendar view needs all todos regardless of pagination
  const { data: allTodos, isLoading, error, refetch: refetchCalendarTodos } = useQuery<Todo[], Error>({
    queryKey: ['calendarTodos'],
    queryFn: async (): Promise<Todo[]> => {
      if (!user) {
        return [];
      }
      // Special endpoint for calendar view that returns all todos without pagination
      const res = await fetch('/api/todos/all');
      if (!res.ok) throw new Error('Failed to fetch calendar todos');
      return res.json();
    },
    placeholderData: [],
    enabled: !!user,
  });

  // Initialize with current date in Jakarta timezone
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    const jakartaParts = getDatePartsInTimeZone(now.toISOString(), 'Asia/Jakarta');
    return new Date(jakartaParts.year, jakartaParts.month, jakartaParts.day);
  });
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  
  // Get current month and year from the currentDate
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Get first day of the month
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Get last day of the month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Function to get tasks for a specific day in the current month
  // This needs to properly handle timezone conversions
  const getTasksForDate = useCallback((day: number): Todo[] => {
    if (!allTodos) return [];
    
    // Create a date object for the target day in current month/year
    const date = new Date(currentYear, currentMonth, day);
    const targetDateISOString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Filter tasks based on startDate
    return allTodos.filter(task => {
      if (!task.startDate) return false;
      
      // Get the parts of the startDate in Jakarta timezone
      const taskDateParts = getDatePartsInTimeZone(task.startDate, 'Asia/Jakarta');
      
      // Create a new date with these parts to get YYYY-MM-DD
      const taskDateInJakarta = new Date(
        taskDateParts.year, 
        taskDateParts.month, 
        taskDateParts.day
      ).toISOString().split('T')[0];
      
      return taskDateInJakarta === targetDateISOString;
    });
  }, [allTodos, currentYear, currentMonth]);
  
  // Calendar navigation functions
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  }, []);
  
  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  }, []);
  
  const goToToday = useCallback(() => {
    const now = new Date();
    const jakartaParts = getDatePartsInTimeZone(now.toISOString(), 'Asia/Jakarta');
    const todayInJakarta = new Date(jakartaParts.year, jakartaParts.month, jakartaParts.day);
    
    setCurrentDate(todayInJakarta);
    setSelectedDate(todayInJakarta);
  }, []);
  
  // Format month for display in Indonesian
  const formatMonthDisplay = useCallback((date: Date): string => {
    return date.toLocaleString("id-ID", { 
      month: 'long', 
      year: 'numeric' 
    });
  }, []);
  
  // Format date in Indonesian format
  const formatIndonesianDate = useCallback((date: Date): string => {
    return date.toLocaleString("id-ID", {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }, []);
  
  // Selected date tasks
  const selectedDateTasks = useCallback(() => {
    if (!selectedDate) return [];
    return getTasksForDate(selectedDate.getDate());
  }, [selectedDate, getTasksForDate]);

  // After mutations, make sure to refresh calendar data
  const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    await addTodo(todoData);
    refetchCalendarTodos();
  };

  const handleUpdateTodo = async (id: number, updateData: Partial<Todo>) => {
    await updateTodo(id, updateData);
    refetchCalendarTodos();
  };

  const handleDeleteTodo = async (id: number) => {
    await deleteTodo(id);
    refetchCalendarTodos();
  };

  const handleToggleStatus = async (id: number) => {
    await toggleTodoStatus(id);
    refetchCalendarTodos();
  };

  // Month data computation - now using startDate instead of dueDate
  const monthData = useCallback(() => {
    // Track which dates have tasks
    const datesWithTasks: Record<string, number> = {};
    const datesWithHighPriority: Record<string, boolean> = {};
    const datesWithOverdue: Record<string, boolean> = {};
    
    if (!allTodos) return { datesWithTasks, datesWithHighPriority, datesWithOverdue };
    
    // Process each todo to count them by date in the calendar
    allTodos.forEach(task => {
      // Skip tasks without startDate
      if (!task.startDate) return;
      
      try {
        // Get task date parts in Jakarta timezone
        const taskDateParts = getDatePartsInTimeZone(task.startDate, 'Asia/Jakarta');
        
        // Only process tasks for the current month/year
        if (taskDateParts.month === currentMonth && taskDateParts.year === currentYear) {
          // Format for map key: YYYY-MM-DD
          const dateKey = `${taskDateParts.year}-${String(taskDateParts.month + 1).padStart(2, '0')}-${String(taskDateParts.day).padStart(2, '0')}`;
          
          // Count tasks per date
          if (!datesWithTasks[dateKey]) {
            datesWithTasks[dateKey] = 0;
          }
          datesWithTasks[dateKey]++;
          
          // Track high priority tasks
          if (task.priority === 'high') {
            datesWithHighPriority[dateKey] = true;
          }
          
          // Track overdue tasks (still using dueDate for overdue calculation)
          if (task.dueDate && isOverdue(task.dueDate) && task.status !== 'completed') {
            datesWithOverdue[dateKey] = true;
          }
        }
      } catch (e) {
        console.error("Error processing task date:", e);
      }
    });
    
    return { datesWithTasks, datesWithHighPriority, datesWithOverdue };
  }, [allTodos, currentMonth, currentYear, isOverdue]);

  return {
    // Data
    allTodos: allTodos || [],
    isLoading,
    error,
    
    // Calendar state
    currentDate,
    currentMonth,
    currentYear,
    selectedDate,
    selectedTask,
    firstDayOfWeek,
    daysInMonth,
    monthData: monthData(),
    
    // Functions
    setCurrentDate,
    setSelectedDate,
    setSelectedTask,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    formatMonthDisplay,
    formatIndonesianDate,
    getTasksForDate,
    selectedDateTasks,
    setTodoStatus,
    
    // Todo operations (wrapped to refresh calendar)
    addTodo: handleAddTodo,
    updateTodo: handleUpdateTodo,
    deleteTodo: handleDeleteTodo,
    toggleTodoStatus: handleToggleStatus,
    markSelectedAsCompleted,
    deleteSelected,
    refetchTodos: refetchCalendarTodos,
    
    // Helper functions
    formatDate,
    getPriorityColor,
    isOverdue,
    
    // Expose helper for timezone handling
    getDatePartsInTimeZone
  };
}