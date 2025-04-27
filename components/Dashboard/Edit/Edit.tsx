'use client'

import { ModalDialog } from "@/components/Modal/Modal"
import { FormComponents } from "../Form/Form"
import { Todo, TodoFormValues } from "../Types"

interface EditProps {
    todo: Todo;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    fetchTodos: () => Promise<void>;
    setError: (error: string) => void;
}

export const Edit: React.FC<EditProps> = ({
    todo,
    open,
    setOpen,
    fetchTodos,
    setError
}) => {
    const handleEditSubmit = async (formValues: TodoFormValues) => {
        try {
            // Format the todo for the API
            const updateData = {
                title: formValues.title,
                description: formValues.description || "",
                status: formValues.status || "pending",
                priority: formValues.priority || "medium",
                dueDate: formValues.dueDate || null
            };

            // Log the exact todo ID and URL we're using
            const url = `/api/todos/${todo.id}`;
            console.log('Updating todo with ID:', todo.id);
            console.log('Making request to URL:', url);
            console.log('Update data:', updateData);

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                throw new Error(errorData.error || 'Failed to update todo');
            }

            const data = await response.json();
            console.log('Successfully updated todo:', data);

            // Close the modal
            setOpen(false);

            // Refresh the todo list
            fetchTodos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error updating todo:', err);
        }
    };

    const handleClose = () => {
        setOpen(false)
    }


    return (
        <ModalDialog
            modalBodyComponents={
                <FormComponents
                    isEditing={true}
                    editingTodo={todo}
                    onSubmit={handleEditSubmit}
                    onClose={handleClose}
                />
            }
            open={open}
            setOpen={setOpen}
            title="Edit Task"
            description="Update your task details below."
        />
    );
};