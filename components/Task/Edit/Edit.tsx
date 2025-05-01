'use client'

import { ModalDialog } from "@/components/Modal/Modal"
import { FormComponents } from "../Form/Form"
import { Todo, TodoFormValues } from "@/Types/Types"
import { useTodos } from "@/hooks/useTodos"
import { useCalendarTodos } from "@/hooks/useTodoCalendar"

interface EditProps {
    todo: Todo;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Edit: React.FC<EditProps> = ({
    todo,
    open,
    setOpen
}) => {
    // Get the updateTodo function from the useTodos hook
    const { updateTodo } = useTodos();
    const { refetchTodos } = useCalendarTodos();

    const handleEditSubmit = async (formValues: TodoFormValues) => {
        try {
            // Format the todo data for the API with the correct type for dueDate
            const updateData = {
                title: formValues.title,
                description: formValues.description || "",
                status: formValues.status || "pending",
                priority: formValues.priority || "medium",
                startDate: formValues.startDate || "",
                time: formValues.time || "",
                dueDate: formValues.dueDate || "" // Use empty string instead of undefined/null
            };

            // Use the updateTodo function from the hook
            await updateTodo(todo.id, updateData);

            // Pastikan memanggil refetchTodos dari useCalendarTodos
            refetchTodos();

            // Close the modal on success
            setOpen(false);
        } catch (err) {
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