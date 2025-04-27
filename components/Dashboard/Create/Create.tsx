'use client'

import { ModalDialog } from "@/components/Modal/Modal"
import { FormComponents } from "../Form/Form"
import { TodoFormValues } from "../Types"

interface CreateProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    fetchTodos: () => Promise<void>;
    setError: (error: string) => void;
}

export const Create: React.FC<CreateProps> = ({
    open,
    setOpen,
    fetchTodos,
    setError
}) => {
    const handleCreateSubmit = async (formValues: TodoFormValues) => {
        try {
            // Format the todo for the API
            const todoData = {
                title: formValues.title,
                description: formValues.description || "",
                status: formValues.status || "pending",
                priority: formValues.priority || "medium",
                dueDate: formValues.dueDate || null
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

            // Close the modal
            setOpen(false);

            // Refresh the todo list
            fetchTodos();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error adding todo:', err);
        }
    };

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <ModalDialog
            modalBodyComponents={
                <FormComponents
                    isEditing={false}
                    editingTodo={null}
                    onSubmit={handleCreateSubmit}
                    onClose={handleClose}
                />
            }
            open={open}
            setOpen={setOpen}
            title="Add new task"
            description="Fill out the form below to create a new task."
        />
    );
};