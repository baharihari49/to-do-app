'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';

// Define types
export type Todo = {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type PaginationData = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type FilterType = 'all' | 'pending' | 'completed';
export type SortByType = 'dueDate' | 'priority';

export type SelectedTodos = {
  [key: string]: boolean;
};

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortByType>('dueDate');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [selected, setSelected] = useState<SelectedTodos>({});
  const [selectedCount, setSelectedCount] = useState(0);

  // Fetch todos from API
  const fetchTodos = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const status = filter === 'all' ? '' : filter;
      const url = `/api/todos?page=${currentPage}&limit=${pagination.limit}${status ? `&status=${status}` : ''}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch todos');
      }
      
      const data = await response.json();
      setTodos(data.todos);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching todos:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentPage, pagination.limit, filter]);

  // Fetch todos when dependencies change
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Get sorted todos based on sortBy
  const getSortedTodos = useCallback(() => {
    if (sortBy === 'dueDate') {
      return [...todos].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return [...todos].sort((a, b) => {
        return priorityOrder[a.priority as keyof typeof priorityOrder] - 
               priorityOrder[b.priority as keyof typeof priorityOrder];
      });
    }
    return todos;
  }, [todos, sortBy]);

  // Check if a date is overdue
  const isOverdue = useCallback((dateString: string | null) => {
    if (!dateString) return false;
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }, []);

  // Format date for display
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Get color for priority badge
  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
      default:
        return '';
    }
  }, []);

  // Handle selecting a todo
  const handleSelect = useCallback((id: string, isChecked: boolean) => {
    setSelected(prev => ({ ...prev, [id]: isChecked }));
    setSelectedCount(prev => isChecked ? prev + 1 : prev - 1);
  }, []);

  // Handle selecting all todos
  const handleSelectAll = useCallback((isChecked: boolean) => {
    const newSelected: SelectedTodos = {};
    
    todos.forEach(todo => {
      newSelected[todo.id] = isChecked;
    });
    
    setSelected(newSelected);
    setSelectedCount(isChecked ? todos.length : 0);
  }, [todos]);

  // Add new todo
  const addTodo = useCallback(async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add todo');
      }
      
      const data = await response.json();
      
      // Refresh todos
      await fetchTodos();
      
      return data.todo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error adding todo:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchTodos]);

  // Toggle todo status
  const toggleTodoStatus = useCallback(async (id: string) => {
    if (!user) return;
    
    setError(null);
    
    try {
      // Find current todo status
      const todo = todos.find(t => t.id === id);
      if (!todo) return;
      
      const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
      
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update todo');
      }
      
      // Update local state
      setTodos(prev => 
        prev.map(t => 
          t.id === id ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating todo status:', err);
    }
  }, [user, todos]);

  // Delete todo
  const deleteTodo = useCallback(async (id: string) => {
    if (!user) return;
    
    setError(null);
    
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete todo');
      }
      
      // Update local state
      setTodos(prev => prev.filter(t => t.id !== id));
      
      // Update selected state if needed
      if (selected[id]) {
        setSelected(prev => {
          const newSelected = { ...prev };
          delete newSelected[id];
          return newSelected;
        });
        setSelectedCount(prev => prev - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting todo:', err);
    }
  }, [user, selected]);

  // Mark selected todos as completed
  const markSelectedAsCompleted = useCallback(async () => {
    if (!user || selectedCount === 0) return;
    
    setError(null);
    
    try {
      const selectedIds = Object.keys(selected).filter(id => selected[id]);
      
      const response = await fetch('/api/todos/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete',
          ids: selectedIds,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update todos');
      }
      
      // Update local state
      setTodos(prev => 
        prev.map(todo => 
          selected[todo.id] ? { ...todo, status: 'completed' } : todo
        )
      );
      
      // Clear selection
      setSelected({});
      setSelectedCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error marking todos as completed:', err);
    }
  }, [user, selected, selectedCount]);

  // Delete selected todos
  const deleteSelected = useCallback(async () => {
    if (!user || selectedCount === 0) return;
    
    setError(null);
    
    try {
      const selectedIds = Object.keys(selected).filter(id => selected[id]);
      
      const response = await fetch('/api/todos/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          ids: selectedIds,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete todos');
      }
      
      // Update local state
      setTodos(prev => prev.filter(todo => !selected[todo.id]));
      
      // Clear selection
      setSelected({});
      setSelectedCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting todos:', err);
    }
  }, [user, selected, selectedCount]);

  return {
    todos,
    sortedTodos: getSortedTodos(),
    paginatedTodos: todos, // The API already handles pagination
    isLoading,
    error,
    filter,
    sortBy,
    currentPage,
    pagination,
    selected,
    selectedCount,
    setFilter,
    setSortBy,
    setCurrentPage,
    fetchTodos,
    handleSelect,
    handleSelectAll,
    markSelectedAsCompleted,
    deleteSelected,
    toggleTodoStatus,
    deleteTodo,
    addTodo,
    formatDate,
    getPriorityColor,
    isOverdue,
  };
}