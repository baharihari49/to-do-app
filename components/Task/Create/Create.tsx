'use client'

import { ModalDialog } from "@/components/Modal/Modal"
import { FormComponents } from "../Form/Form"
import { TodoFormValues } from "@/Types/Types"
import { useTodos } from "@/hooks/useTodos"

interface CreateProps {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Create: React.FC<CreateProps> = ({
    open,
    setOpen
}) => {
    // Get the addTodo function from the useTodos hook
    const { addTodo } = useTodos();

    const handleCreateSubmit = async (formValues: TodoFormValues) => {
        try {
            // Format the todo data with the correct type for dueDate
            // Since Todo.dueDate is a required string, provide an empty string if no due date
            const todoData = {
                title: formValues.title,
                description: formValues.description || "",
                status: formValues.status || "pending",
                priority: formValues.priority || "medium",
                startDate: formValues.startDate || "",
                time: formValues.time || "",
                dueDate: formValues.dueDate || "" // Use empty string instead of undefined/null
            };

            // Use the addTodo function from the hook
            await addTodo(todoData);
            
            // Close the modal on success
            setOpen(false);
        } catch (err) {
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