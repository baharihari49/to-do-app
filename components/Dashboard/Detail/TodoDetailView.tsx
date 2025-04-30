// TodoDetailView.tsx
import { useState } from 'react';
import { TodoHeader } from './TodoHeader';
import { TodoDescription } from './TodoDescription';
import { TodoDetails } from './TodoDetails';
import { TodoCreator } from './TodoCreator';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { Todo } from '@/Types/Types';

interface TodoDetailViewProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: number) => void;
  onBack?: () => void;
  onToggleStatus?: (id: number) => void;
  onSetStatus?: (id: number, status: 'pending' | 'in-progress' | 'completed') => void;
}

const TodoDetailView: React.FC<TodoDetailViewProps> = ({ 
  todo, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onSetStatus
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(todo.id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="w-full px-1">
      {/* Header area with title and actions */}
      <TodoHeader 
        todo={todo} 
        onEdit={onEdit} 
        onToggleStatus={onToggleStatus}
        onSetStatus={onSetStatus}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
      />
      
      {/* Content area */}
      <div className="space-y-6">
        {/* Description */}
        <TodoDescription description={todo.description} />
        
        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TodoDetails todo={todo} />
          
          {todo.createdBy && <TodoCreator createdBy={todo.createdBy} />}
        </div>
      </div>

      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen} 
        setIsOpen={setIsDeleteDialogOpen}
        onDelete={handleDelete} 
      />
    </div>
  );
};

export default TodoDetailView;