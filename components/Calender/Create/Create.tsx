'use client';

import { ModalDialog } from "@/components/Modal/Modal";
import { FormComponents } from "@/components/Dashboard/Form/Form";
import { TodoFormValues } from "@/Types/Types";
import { useCalendarTodos } from "@/hooks/useTodoCalendar"; // Gunakan hook calendar
import { useEffect, useState } from "react";

interface CreateProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    selectedDate?: Date | null;
}

export const Create: React.FC<CreateProps> = ({
    open,
    setOpen,
    selectedDate
}) => {
    // Gunakan useCalendarTodos untuk calendar view
    const { addTodo, refetchTodos } = useCalendarTodos();
    const [initialValues, setInitialValues] = useState<Partial<TodoFormValues>>({});

    useEffect(() => {
        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            setInitialValues({
                startDate: formattedDate,
                dueDate: formattedDate
            });
        } else {
            setInitialValues({});
        }
    }, [selectedDate]);

    const handleCreateSubmit = async (formValues: TodoFormValues) => {
        try {
            const todoData = {
                title: formValues.title,
                description: formValues.description || "",
                status: formValues.status || "pending",
                priority: formValues.priority || "medium",
                startDate: formValues.startDate || "",
                time: formValues.time || "",
                dueDate: formValues.dueDate || ""
            };

            await addTodo(todoData);
            
            // Pastikan memanggil refetchTodos dari useCalendarTodos
            refetchTodos();
            
            setOpen(false);
        } catch (err) {
            console.error('Error adding todo:', err);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <ModalDialog
            modalBodyComponents={
                <FormComponents
                    isEditing={false}
                    editingTodo={null}
                    onSubmit={handleCreateSubmit}
                    onClose={handleClose}
                    initialValues={initialValues}
                />
            }
            open={open}
            setOpen={setOpen}
            title="Tambah tugas baru"
            description="Isi formulir di bawah ini untuk membuat tugas baru."
        />
    );
};