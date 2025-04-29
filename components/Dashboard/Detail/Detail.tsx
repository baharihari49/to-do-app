import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Eye, X } from "lucide-react";
import TodoDetailView from './TodoDetailView';
import { Todo } from '@/Types/Types';

interface DetailProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: number) => void;
  onToggleStatus?: (id: number) => void;
  fetchTodos?: () => void;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  isRowClickable?: boolean;
}

export const Detail: React.FC<DetailProps> = ({
  todo,
  onEdit,
  onDelete,
  onToggleStatus,
  fetchTodos,
  open,
  setOpen,
  isRowClickable = false
}) => {
  // Gunakan internal state jika external state tidak diberikan
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Tentukan state mana yang digunakan
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = setOpen || setInternalOpen;
  
  // Perbarui internal state saat prop open berubah
  useEffect(() => {
    if (open !== undefined) {
      setInternalOpen(open);
    }
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleEdit = (todo: Todo) => {
    if (onEdit) {
      onEdit(todo);
    }
    setIsOpen(false);
  };

  const handleDelete = (id: number) => {
    if (onDelete) {
      onDelete(id);
    }
    setIsOpen(false);
  };

  const handleToggleStatus = (id: number) => {
    if (onToggleStatus) {
      onToggleStatus(id);
    }
    // Tidak perlu menutup sheet setelah toggle status
    // Pengguna mungkin ingin melihat perubahan status
    if (fetchTodos) {
      fetchTodos();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {!isRowClickable && (
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </SheetTrigger>
      )}
      <SheetContent side="right" className="w-full p-0 sm:max-w-md md:max-w-lg lg:max-w-3xl overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-gray-950 p-4 border-b">
          <SheetTitle className="text-xl font-bold">Task Detail</SheetTitle>
          <SheetClose asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </div>
        <div className="p-6">
          {todo && (
            <TodoDetailView
              todo={todo}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBack={handleClose}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};