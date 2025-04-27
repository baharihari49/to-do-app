import { Todo, SelectedTodos, PriorityLevel } from "../Types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MoreHorizontal, Pencil, Trash, Calendar } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface TodoRowProps {
    todo: Todo;
    selected: SelectedTodos;
    handleSelect: (id: number, isChecked: boolean) => void;
    handleOpenDetailSheet: (todo: Todo) => void;
    getPriorityColor: (priority: PriorityLevel) => string;
    formatDate: (dateString: string) => string;
    isOverdue: (dateString: string) => boolean;
    toggleTodoStatus: (id: number) => void;
    handleOpenEditModal: (todo: Todo) => void;
    deleteTodo: (id: number) => void;
}


// Komponen untuk baris todo
export const TodoRow: React.FC<TodoRowProps> = ({
    todo,
    selected,
    handleSelect,
    handleOpenDetailSheet,
    getPriorityColor,
    formatDate,
    isOverdue,
    toggleTodoStatus,
    handleOpenEditModal,
    deleteTodo
}) => (
    <tr className={`border-b transition-colors ${todo.status === "completed" ? "bg-muted/20" : ""}`}>
        <td className="p-4 align-middle" onClick={(e) => e.stopPropagation()}>
            <Checkbox
                checked={selected[todo.id] || false}
                onCheckedChange={(checked) => handleSelect(todo.id, !!checked)}
            />
        </td>
        <td
            className="p-4 align-middle font-medium cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => handleOpenDetailSheet(todo)}
        >
            <div className="flex flex-col">
                <span className={`${todo.status === "completed" ? "line-through text-muted-foreground" : ""} font-medium`}>
                    {todo.title}
                </span>
                {todo.description && (
                    <span className="text-xs text-muted-foreground truncate max-w-64 mt-1">
                        {todo.description}
                    </span>
                )}
            </div>
        </td>
        <td
            className="p-4 align-middle cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => handleOpenDetailSheet(todo)}
        >
            <Badge className={`${getPriorityColor(todo.priority)}`}>
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </Badge>
        </td>
        <td
            className="p-4 align-middle cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => handleOpenDetailSheet(todo)}
        >
            <span className={`flex items-center gap-1.5 ${isOverdue(todo.dueDate) && todo.status !== "completed"
                ? "text-destructive font-medium"
                : ""
                }`}>
                <Calendar className="h-4 w-4 opacity-70" />
                {formatDate(todo.dueDate)}
            </span>
        </td>
        <td
            className="p-4 align-middle cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => handleOpenDetailSheet(todo)}
        >
            <Badge
                variant={todo.status === "completed" ? "default" : "outline"}
                className={todo.status === "completed" ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-200" : ""}
            >
                {todo.status === "completed" ? "Completed" : "Pending"}
            </Badge>
        </td>
        <td className="p-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTodoStatus(todo.id)}
                    className={todo.status === "completed" ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-muted-foreground hover:text-primary"}
                >
                    <CheckCircle2 className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => handleOpenEditModal(todo)}
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => deleteTodo(todo.id)}
                        >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </td>
    </tr>
);