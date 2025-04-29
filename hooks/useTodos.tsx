'use client';

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { Todo, PriorityLevel, FilterType, SortByType, SelectedTodos } from '@/Types/Types';
import { formatDate, isOverdue, getPriorityColor } from '@/utils/todoHelpers';

export type PaginationData = {
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type StatsData = {
  completedTodos: number;
  completionRate: number;
};

type TodosResponse = {
  todos: Todo[];
  pagination: PaginationData;
};

export function useTodos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortByType>('dueDate');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(5);
  const [selected, setSelected] = useState<SelectedTodos>({});

  const selectedCount = Object.values(selected).filter(Boolean).length;

  const todosQueryKey = ['todos', { filter, currentPage, limit }];

  const { data: todosData, isLoading, error, refetch: refetchTodos } = useQuery<TodosResponse, Error>({
    queryKey: todosQueryKey,
    queryFn: async (): Promise<TodosResponse> => {
      if (!user) {
        return { todos: [], pagination: { total: 0, page: 1, limit, pages: 0 } };
      }
      const status = filter === 'all' ? '' : `&status=${filter}`;
      const res = await fetch(`/api/todos?page=${currentPage}&limit=${limit}${status}`);
      if (!res.ok) throw new Error('Failed to fetch todos');
      return res.json();
    },
    placeholderData: {
      todos: [],
      pagination: { total: 0, page: 1, limit, pages: 0 },
    },
    enabled: !!user,
  });

  const { data: statsData } = useQuery<StatsData, Error>({
    queryKey: ['todosStats'],
    queryFn: async (): Promise<StatsData> => {
      if (!user) {
        return { completedTodos: 0, completionRate: 0 };
      }
      const res = await fetch('/api/todos/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    placeholderData: {
      completedTodos: 0,
      completionRate: 0,
    },
    enabled: !!user,
  });

  const addTodoMutation = useMutation({
    mutationFn: async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      });
      if (!res.ok) throw new Error('Failed to add todo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todosStats'] });
      queryClient.invalidateQueries({ queryKey: ['calendarTodos'] });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: number | string; updateData: Partial<Todo> }) => {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todosStats'] });
      queryClient.invalidateQueries({ queryKey: ['calendarTodos'] });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number | string) => {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete todo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todosStats'] });
      queryClient.invalidateQueries({ queryKey: ['calendarTodos'] });
    },
  });

  const batchMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: 'complete' | 'delete'; ids: string[] }) => {
      console.log(`Executing batch ${action} operation with ids:`, ids);
  
      // PERUBAHAN: Jangan filter berdasarkan isNaN karena UUID bukan angka
      // Validasi bahwa ID tidak kosong dan memiliki format yang valid
      const validIds = ids.filter(id => id && typeof id === 'string' && id.trim() !== '');
  
      console.log("Valid IDs:", validIds);
  
      if (validIds.length === 0) {
        console.warn('No valid IDs provided for batch operation');
        return { message: 'No valid IDs provided' };
      }
  
      try {
        const res = await fetch('/api/todos/batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          // PERUBAHAN: Kirim validIds langsung tanpa konversi tambahan
          body: JSON.stringify({
            action,
            ids: validIds
          }),
        });
  
        // Log response status untuk debugging
        console.log(`Batch operation response status: ${res.status}`);
  
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Batch operation failed (${res.status}):`, errorText);
  
          let errorJson;
          try {
            errorJson = JSON.parse(errorText);
          } catch (e) {
            errorJson = { message: errorText || res.statusText };
          }
  
          throw new Error(`Failed batch operation: ${errorJson.message || res.statusText}`);
        }
  
        return await res.json();
      } catch (error) {
        console.error('Error in batch operation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todosStats'] });
      queryClient.invalidateQueries({ queryKey: ['calendarTodos'] });
      // Reset selected items setelah operasi batch berhasil
      setSelected({});
    },
    onError: (error) => {
      console.error("Batch mutation error:", error);
      // Opsional: tambahkan notifikasi error ke user di sini
    }
  });

  const todos = todosData?.todos || [];
  const pagination = todosData?.pagination || { total: 0, page: 1, limit, pages: 0 };

  const getSortedTodos = useCallback(() => {
    if (sortBy === 'dueDate') {
      return [...todos].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return [...todos].sort((a, b) =>
        priorityOrder[a.priority as keyof typeof priorityOrder] -
        priorityOrder[b.priority as keyof typeof priorityOrder]
      );
    }
    return todos;
  }, [todos, sortBy]);
  const handleSelect = useCallback((id: number, isChecked: boolean) => {
    setSelected(prev => ({ ...prev, [id]: isChecked }));
  }, []);

  const handleSelectAll = useCallback((isChecked: boolean) => {
    const newSelected: SelectedTodos = {};
    todos.forEach(todo => {
      newSelected[todo.id] = isChecked;
    });
    setSelected(newSelected);
  }, [todos]);

  const toggleTodoStatus = useCallback(async (id: number | string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';

    await updateTodoMutation.mutateAsync({
      id,
      updateData: { status: newStatus }
    });

    queryClient.invalidateQueries({ queryKey: ['todos'] });
    queryClient.invalidateQueries({ queryKey: ['todosStats'] });
    queryClient.invalidateQueries({ queryKey: ['calendarTodos'] });
  }, [todos, updateTodoMutation, queryClient]);

  // Set specific status function
  const setTodoStatus = useCallback(async (id: number | string, status: 'pending' | 'in-progress' | 'completed') => {
    try {
      await updateTodoMutation.mutateAsync({
        id,
        updateData: { status }
      });

      // Invalidate all relevant queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todosStats'] });
      queryClient.invalidateQueries({ queryKey: ['calendarTodos'] });
    } catch (error) {
      console.error(`Error setting task status to ${status}:`, error);
    }
  }, [updateTodoMutation, queryClient]);

  // Helper for getting selected IDs
  const getSelectedIds = useCallback(() => {
    return Object.entries(selected)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id);
  }, [selected]);

  return {
    todos,
    sortedTodos: getSortedTodos(),
    isLoading,
    error,
    filter,
    sortBy,
    currentPage,
    pagination,
    selected,
    selectedCount,
    stats: statsData ? { completedCount: statsData.completedTodos, completionRate: statsData.completionRate } : { completedCount: 0, completionRate: 0 },
    setFilter,
    setSortBy,
    setCurrentPage,
    setSelected,
    addTodo: addTodoMutation.mutateAsync,
    updateTodo: (id: number | string, updateData: Partial<Todo>) => updateTodoMutation.mutateAsync({ id, updateData }),
    deleteTodo: deleteTodoMutation.mutateAsync,
    // Di markSelectedAsCompleted
    markSelectedAsCompleted: () => {
      // ID yang dipilih harus menggunakan ID asli (UUID) bukan angka
      console.log(selected);
      const selectedIds = Object.entries(selected)
        .filter(([_, isSelected]) => isSelected === true)
        .map(([id, _]) => id); // Gunakan ID asli (bukan parseInt)

      console.log("Selected IDs for completion:", selectedIds);

      if (selectedIds.length === 0) {
        console.warn('No items selected for completion');
        return Promise.resolve();
      }

      return batchMutation.mutateAsync({
        action: 'complete',
        ids: selectedIds // Sudah dalam format string
      });
    },

    deleteSelected: () => {
      const selectedIds = Object.entries(selected)
        .filter(([_, isSelected]) => isSelected === true)
        .map(([id, _]) => id, 10);

      console.log("Selected IDs for deletion:", selectedIds);

      if (selectedIds.length === 0) {
        console.warn('No items selected for deletion');
        return Promise.resolve();
      }

      // Gunakan try-catch untuk menangkap error
      return batchMutation.mutateAsync({
        action: 'delete',
        ids: selectedIds
      }).catch(error => {
        console.error("Error deleting todos:", error);
        throw error;
      });
    },
    refetchTodos,
    formatDate,
    getPriorityColor,
    isOverdue,
    handleSelect,
    handleSelectAll,
    toggleTodoStatus,
    setTodoStatus
  };
}