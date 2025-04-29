'use client';

import { useState } from 'react';
import TodoCalendarView from '@/components/Calender';
import { useCalendarTodos } from '@/hooks/useTodoCalendar';
import { Todo } from '@/Types/Types';
import { Create } from '@/components/Dashboard/Create/Create';
import { Edit } from '@/components/Dashboard/Edit/Edit';
import { Detail } from '@/components/Dashboard/Detail/Detail';

export default function CalendarPage() {
  const {
    isLoading,
    deleteTodo,
    toggleTodoStatus,
    refetchTodos
  } = useCalendarTodos();

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);


  // Open edit modal from detail view
  const handleEditFromDetail = (todo: Todo) => {
    setSelectedTodo(todo);
    setDetailModalOpen(false);
    setEditModalOpen(true);
  };

  // Handle task deletion
  const handleTaskDelete = async (id: string | number) => {
    try {
      await deleteTodo(Number(id));
      setDetailModalOpen(false);
      refetchTodos();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Handle task status toggle
  const handleTaskStatusToggle = (id: string | number) => {
    toggleTodoStatus(Number(id));
    refetchTodos();
  };

  // Loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Task Calendar</h1>
      
      <TodoCalendarView />
      
      {/* Create Task Modal */}
      <Create 
        open={createModalOpen} 
        setOpen={setCreateModalOpen} 
      />
      
      {/* Edit Task Modal */}
      {selectedTodo && (
        <Edit 
          open={editModalOpen} 
          setOpen={setEditModalOpen}
          todo={selectedTodo}
        />
      )}
      
      {/* Task Detail Drawer */}
      {selectedTodo && (
        <Detail
          todo={selectedTodo}
          open={detailModalOpen}
          setOpen={setDetailModalOpen}
          onEdit={handleEditFromDetail}
          onDelete={handleTaskDelete}
          onToggleStatus={handleTaskStatusToggle}
          fetchTodos={refetchTodos}
        />
      )}
    </div>
  );
}