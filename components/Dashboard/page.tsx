'use client';

import { useEffect } from 'react';
import { ListTable } from './ListTable/Table';
import { Overview } from './OverView';
import { useTodos } from '@/hooks/useTodos';
import { TodoDashboardProps } from '@/Types/Types';

const TodoDashboard: React.FC<TodoDashboardProps> = () => {
  const {
    todos,
    sortedTodos,
    isLoading,
    error,
    filter,
    sortBy,
    currentPage,
    pagination,
    selected,
    selectedCount,
    stats,
    setFilter,
    setSortBy,
    setCurrentPage,
    handleSelect,
    handleSelectAll,
    markSelectedAsCompleted,
    deleteSelected,
    toggleTodoStatus,
    deleteTodo,
    addTodo,
    updateTodo, // <-- ambil updateTodo dari hook
    formatDate,
    getPriorityColor,
    isOverdue,
  } = useTodos();

  const itemsPerPage = 5;
  const totalCount = pagination.total;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Log data for debugging
  useEffect(() => {
    console.log("TodoDashboard todos count:", todos.length);
    console.log("TodoDashboard sortedTodos count:", sortedTodos.length);
  }, [todos, sortedTodos]);

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

  if (error && todos.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <p className="font-medium">Error loading tasks</p>
          <p>{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Overview
        completedCount={stats.completedCount}
        todos={todos}
        completionRate={stats.completionRate}
        isOverdue={isOverdue}
      />

      <ListTable
        todos={todos}
        paginatedTodos={sortedTodos}
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
        onTaskAdded={addTodo} // Gunakan langsung addTodo dari hook
        onTaskUpdated={updateTodo} // Gunakan langsung updateTodo dari hook
        fetchTodos={() => {}} // Tidak perlu lagi manual fetch
        setError={() => {}} // Kosongkan karena error handling sudah di react-query
      />
    </div>
  );
};

export default TodoDashboard;
