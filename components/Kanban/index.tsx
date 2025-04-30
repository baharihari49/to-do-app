'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import {
  Calendar, 
  MoreHorizontal, 
  Trash,
  X,
  Clock3,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { PriorityLevel, StatusType, Todo } from '@/Types/Types';

// Kanban-only component
const KanbanOnly = () => {
  const {
    allTodos,
    isLoading,
    isLoadingAllTodos,
    deleteTodo,
    setTodoStatus,
    formatDate,
    getPriorityColor,
    isOverdue,
  } = useTodos();
  
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<Todo | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<StatusType | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Group todos by status
  const pending = allTodos.filter(todo => todo.status === 'pending');
  const inProgress = allTodos.filter(todo => todo.status === 'in-progress');
  const completed = allTodos.filter(todo => todo.status === 'completed');

  // Handle drag events
  const handleDragStart = (todo: Todo) => {
    setDraggedItem(todo);
    setActiveItem(todo.id);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: StatusType) => {
    e.preventDefault();
    setDragOverColumn(status);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: StatusType) => {
    e.preventDefault();
    if (draggedItem && draggedItem.status !== status) {
      setTodoStatus(draggedItem.id, status);
    }
    setDraggedItem(null);
    setActiveItem(null);
    setDragOverColumn(null);
  };
  
  // Render a kanban card
  const renderCard = (todo: Todo) => {
    return (
      <div 
        key={todo.id}
        className={`p-3 mb-2 bg-card rounded-lg border shadow-sm cursor-move ${
          activeItem === todo.id ? 'ring-2 ring-primary' : ''
        } ${dragOverColumn === todo.status ? 'opacity-50' : ''}`}
        draggable={true}
        onDragStart={() => handleDragStart(todo)}
        onDragEnd={() => {
          setActiveItem(null);
          setDraggedItem(null);
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div className={`font-medium ${
            todo.status === 'completed' ? 'line-through text-muted-foreground' : ''
          }`}>
            {todo.title}
          </div>
          <div className="flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {todo.status !== 'pending' && (
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setTodoStatus(todo.id, 'pending')}
                  >
                    Move to Pending
                  </DropdownMenuItem>
                )}
                {todo.status !== 'in-progress' && (
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setTodoStatus(todo.id, 'in-progress')}
                  >
                    Move to In Progress
                  </DropdownMenuItem>
                )}
                {todo.status !== 'completed' && (
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setTodoStatus(todo.id, 'completed')}
                  >
                    Move to Completed
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive" 
                  onClick={() => deleteTodo(todo.id)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {todo.description && (
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {todo.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <Badge className={getPriorityColor(todo.priority as PriorityLevel)}>
            {todo.priority}
          </Badge>
          
          <div className={`flex items-center text-xs ${
            isOverdue(todo.dueDate) ? 'text-destructive' : 'text-muted-foreground'
          }`}>
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(todo.dueDate)}
            {isOverdue(todo.dueDate) && todo.status !== 'completed' && (
              <Badge variant="destructive" className="ml-1 text-xs px-1 py-0 h-4">
                Overdue
              </Badge>
            )}
          </div>
          
          {todo.time && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock3 className="h-3 w-3 mr-1" />
              {todo.time}
            </div>
          )}
          
          {todo.startDate && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Start: {formatDate(todo.startDate)}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render a kanban column
  const renderColumn = (title: string, status: StatusType, color: string, todos: Todo[]) => {
    return (
      <div className="flex-1 min-w-72 max-w-80">
        <div className={`p-2 rounded-t-lg ${color} flex justify-between items-center`}>
          <h3 className="font-semibold text-sm">{title}</h3>
          <Badge variant="outline" className="bg-background">{todos.length}</Badge>
        </div>
        <div 
          className="p-2 bg-muted/30 rounded-b-lg h-[calc(100%-2.5rem)] overflow-y-auto"
          onDragOver={(e) => handleDragOver(e, status)}
          onDrop={(e) => handleDrop(e, status)}
        >
          {todos.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm italic border border-dashed rounded-lg">
              No tasks
            </div>
          ) : (
            todos.map((todo) => renderCard(todo))
          )}
        </div>
      </div>
    );
  };
  
  if (isLoading || isLoadingAllTodos) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col items-center">
      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 w-full max-w-5xl">
          {error}
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-2" 
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Kanban board container - centered and with fixed max-width */}
      <div className="w-full max-w-5xl mx-auto">
        <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-13rem)] rounded-lg shadow-sm">
          {renderColumn("To Do", "pending", "bg-blue-100 dark:bg-blue-950", pending)}
          {renderColumn("In Progress", "in-progress", "bg-amber-100 dark:bg-amber-950", inProgress)}
          {renderColumn("Completed", "completed", "bg-green-100 dark:bg-green-950", completed)}
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>Drag and drop tasks between columns to change their status, or use the menu on each card for more options.</p>
        </div>
      </div>
    </div>
  );
};

export default KanbanOnly;