import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Import the Todo type from the shared Types file
import { Todo, TodoFormValues } from '../Dashboard/Types';
import { FormAdd } from './AddForm';

interface ModalDialogProps {
  isEditing?: boolean;
  editingTodo?: Todo | null;
  trigger: React.ReactNode;
  onTaskSubmitted?: (todo: Todo) => void;
}

// Dialog wrapper component for the form
export const ModalDialog: React.FC<ModalDialogProps> = ({ 
  isEditing = false, 
  editingTodo = null, 
  trigger, 
  onTaskSubmitted 
}) => {
  const [open, setOpen] = useState<boolean>(false);
  
  const handleClose = (): void => {
    setOpen(false);
  };
  
  const handleSubmit = (formValues: TodoFormValues): void => {
    console.log('Submitted todo:', formValues);
    
    // Convert the form values to a proper Todo object with a definite ID
    const todo: Todo = {
      ...formValues,
      id: formValues.id || Math.floor(Math.random() * 10000), // Generate a random ID if none exists
      status: formValues.status
    };
    
    // Call the callback if provided
    if (onTaskSubmitted) {
      onTaskSubmitted(todo);
    }
    
    setOpen(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update your task details below."
              : "Fill out the form below to create a new task."}
          </DialogDescription>
        </DialogHeader>
        
        <FormAdd
          isEditing={isEditing}
          editingTodo={editingTodo}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};