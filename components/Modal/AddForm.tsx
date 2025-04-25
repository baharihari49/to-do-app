import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Import the shared types from the Dashboard/Types.ts file
import { Todo as TodoType, TodoFormValues, PriorityLevel } from '../Dashboard/Types';

// Export the Todo type from Types.ts to ensure consistent types
export type Todo = TodoType;

interface FormAddProps {
  isEditing?: boolean;
  editingTodo?: Todo | null;
  onClose: () => void;
  onSubmit: (todo: TodoFormValues) => void;
}

export const FormAdd: React.FC<FormAddProps> = ({
  isEditing = false,
  editingTodo = null,
  onClose,
  onSubmit,
}) => {
  // Initialize the form with default values
  const form = useForm<TodoFormValues>({
    defaultValues: {
      id: editingTodo?.id || null,
      title: editingTodo?.title || '',
      description: editingTodo?.description || '',
      dueDate: editingTodo?.dueDate || '',
      priority: editingTodo?.priority || 'medium',
      status: editingTodo?.status || 'pending'
    }
  });

  // State for date handling (since react-hook-form doesn't handle Date objects well)
  const [dueDate, setDueDate] = useState<Date | undefined>(
    editingTodo?.dueDate ? new Date(editingTodo.dueDate) : undefined
  );

  // Handler for form submission
  const handleSubmit = form.handleSubmit((data) => {
    if (!dueDate) {
      // Validation for due date
      form.setError('dueDate', { message: 'Due date is required' });
      return;
    }

    // Format the date and update the data
    const formattedDate = format(dueDate, 'yyyy-MM-dd');
    
    const todoData: TodoFormValues = {
      ...data,
      dueDate: formattedDate
    };
    
    onSubmit(todoData);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  {...field}
                  placeholder="Enter task title" 
                  required 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  {...field}
                  placeholder="Enter task description" 
                  rows={3} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                      type="button" // Important to prevent form submission
                    >
                      {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      if (date) {
                        field.onChange(format(date, 'yyyy-MM-dd'));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low" className="text-muted-foreground">Low</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium" className="text-muted-foreground">Medium</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high" className="text-muted-foreground">High</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting}
          >
            {isEditing ? 'Update Task' : 'Add Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
};