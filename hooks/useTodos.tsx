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
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async ({ id, updateData }: { id: number; updateData: Partial<Todo> }) => {
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
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete todo');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todosStats'] });
    },
  });

  const batchMutation = useMutation({
    mutationFn: async ({ action, ids }: { action: 'complete' | 'delete'; ids: number[] }) => {
      const res = await fetch('/api/todos/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ids }),
      });
      if (!res.ok) throw new Error('Failed batch operation');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
      queryClient.invalidateQueries({ queryKey: ['todosStats'] });
    },
  });

  const todos = todosData?.todos || [];
  const pagination = todosData?.pagination || { total: 0, page: 1, limit, pages: 0 };

  const getSortedTodos = useCallback(() => {
    if (sortBy === 'dueDate') {
      return [...todos].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
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

  const toggleTodoStatus = useCallback(async (id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';

    await updateTodoMutation.mutateAsync({
      id,
      updateData: { status: newStatus }
    });

    queryClient.invalidateQueries({ queryKey: ['todos'] });
    queryClient.invalidateQueries({ queryKey: ['todosStats'] });
  }, [todos, updateTodoMutation, queryClient]);


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
    updateTodo: (id: number, updateData: Partial<Todo>) => updateTodoMutation.mutateAsync({ id, updateData }),
    deleteTodo: deleteTodoMutation.mutateAsync,
    markSelectedAsCompleted: () => batchMutation.mutateAsync({ action: 'complete', ids: Object.keys(selected).map(Number) }),
    deleteSelected: () => batchMutation.mutateAsync({ action: 'delete', ids: Object.keys(selected).map(Number) }),
    refetchTodos,
    formatDate,
    getPriorityColor,
    isOverdue,
    handleSelect,
    handleSelectAll,
    toggleTodoStatus
  };
}