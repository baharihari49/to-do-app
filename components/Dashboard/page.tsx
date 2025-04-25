'use client'

import { useState, useEffect, useCallback } from 'react';
import { ListTable } from './Table';
import { Overview } from './OverView';
import { useAuth } from '@/lib/auth';

import {
    Todo,
    TodoDashboardProps,
    SelectedTodos,
    FilterType,
    SortByType,
    PriorityLevel
} from './Types';

const TodoDashboard: React.FC<TodoDashboardProps> = () => {
    const { user } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [filter, setFilter] = useState<FilterType>("all");
    const [sortBy, setSortBy] = useState<SortByType>("dueDate");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selected, setSelected] = useState<SelectedTodos>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);

    const itemsPerPage = 5;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Fetch todos from API
    const fetchTodos = useCallback(async () => {
        if (!user) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const status = filter === 'all' ? '' : filter;
            const url = `/api/todos?page=${currentPage}&limit=${itemsPerPage}${status ? `&status=${status}` : ''}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch todos');
            }
            
            const data = await response.json();
            setTodos(data.todos);
            setTotalCount(data.pagination.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching todos:', err);
        } finally {
            setIsLoading(false);
        }
    }, [user, currentPage, itemsPerPage, filter]);

    // Fetch todos when dependencies change
    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);

    // Fetch stats for overview
    const [stats, setStats] = useState({
        completedCount: 0,
        completionRate: 0
    });

    const fetchStats = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await fetch('/api/todos/stats');
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch stats');
            }
            
            const data = await response.json();
            setStats({
                completedCount: data.completedTodos,
                completionRate: data.completionRate
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, [user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats, todos]); // Also update stats when todos change

    // Sort todos based on sortBy
    const sortedTodos = [...todos].sort((a, b) => {
        if (sortBy === "dueDate") {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === "priority") {
            const priorityOrder: Record<PriorityLevel, number> = { high: 1, medium: 2, low: 3 };
            return priorityOrder[a.priority as PriorityLevel] - priorityOrder[b.priority as PriorityLevel];
        }
        return 0;
    });

    // Toggle todo status
    const toggleTodoStatus = async (id: number): Promise<void> => {
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
    };

    // Delete todo
    const deleteTodo = async (id: number): Promise<void> => {
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
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error deleting todo:', err);
        }
    };

    // Add new todo
    const addTodo = async (newTodo: Todo): Promise<void> => {
        try {
            // Format the todo for the API
            const todoData = {
                title: newTodo.title,
                description: newTodo.description || "",
                status: newTodo.status || "pending",
                priority: newTodo.priority || "medium",
                dueDate: newTodo.dueDate || null
            };
            
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
            
            // Refresh the todo list
            fetchTodos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error adding todo:', err);
        }
    };

    // Format date
    const formatDate = (dateString: string | null): string => {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Get priority badge color
    const getPriorityColor = (priority: string): string => {
        switch (priority) {
            case "high": return "bg-destructive/10 text-destructive hover:bg-destructive/20";
            case "medium": return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
            case "low": return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
            default: return "bg-secondary text-secondary-foreground";
        }
    };

    // Check if due date is today or in the past
    const isOverdue = (dateString: string | null): boolean => {
        if (!dateString) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(dateString);
        return dueDate < today;
    };

    // Handler for bulk selection
    const handleSelect = (id: number, isChecked: boolean): void => {
        setSelected(prev => ({
            ...prev,
            [id]: isChecked
        }));
    };

    const handleSelectAll = (isChecked: boolean): void => {
        const newSelected: SelectedTodos = {};
        if (isChecked) {
            todos.forEach(todo => {
                newSelected[todo.id] = true;
            });
        }
        setSelected(newSelected);
    };

    const selectedCount = Object.values(selected).filter(Boolean).length;

    // Handle bulk actions
    const markSelectedAsCompleted = async (): Promise<void> => {
        try {
            const selectedIds = Object.entries(selected)
                .filter(([_, isSelected]) => isSelected)
                .map(([id]) => id);
            
            if (selectedIds.length === 0) return;
            
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error marking todos as completed:', err);
        }
    };

    const deleteSelected = async (): Promise<void> => {
        try {
            const selectedIds = Object.entries(selected)
                .filter(([_, isSelected]) => isSelected)
                .map(([id]) => id);
            
            if (selectedIds.length === 0) return;
            
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error deleting todos:', err);
        }
    };

    // Loading state
    if (isLoading && todos.length === 0) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-32 bg-muted rounded-md mb-6"></div>
                    <div className="h-96 bg-muted rounded-md"></div>
                </div>
            </div>
        );
    }

    // Error state
    if (error && todos.length === 0) {
        return (
            <div className="space-y-6">
                <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
                    <p className="font-medium">Error loading tasks</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Overview Section */}
            <Overview
                completedCount={stats.completedCount}
                todos={todos}
                completionRate={stats.completionRate}
                isOverdue={isOverdue}
            />

            {/* Task Management */}
            <ListTable
                todos={todos}
                paginatedTodos={todos}
                sortedTodos={sortedTodos}
                selected={selected}
                selectedCount={selectedCount}
                filter={filter}
                sortBy={sortBy}
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                setFilter={setFilter}
                setSortBy={setSortBy}
                setCurrentPage={setCurrentPage}
                handleSelect={handleSelect}
                handleSelectAll={handleSelectAll}
                markSelectedAsCompleted={markSelectedAsCompleted}
                deleteSelected={deleteSelected}
                toggleTodoStatus={toggleTodoStatus}
                deleteTodo={deleteTodo}
                formatDate={formatDate}
                getPriorityColor={getPriorityColor}
                isOverdue={isOverdue}
                onTaskAdded={addTodo}
            />
        </div>
    );
};

export default TodoDashboard;