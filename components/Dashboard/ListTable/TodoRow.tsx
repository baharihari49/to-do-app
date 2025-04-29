import { Todo, SelectedTodos, PriorityLevel } from "@/Types/Types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, MoreHorizontal, Pencil, Trash, Calendar, Clock, Play } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface TodoRowProps {
    todo: Todo;
    selected: SelectedTodos;
    handleSelect: (id: number , isChecked: boolean) => void;
    handleOpenDetailSheet: (todo: Todo) => void;
    getPriorityColor: (priority: PriorityLevel) => string;
    formatDate: (dateString: string) => string;
    isOverdue: (dateString: string) => boolean;
    toggleTodoStatus: (id: number ) => void;
    setTodoStatus: (id: number | string, status: 'pending' | 'in-progress' | 'completed') => void;
    handleOpenEditModal: (todo: Todo) => void;
    deleteTodo: (id: number ) => void;
}

// Function to get status badge styling
const getStatusBadgeStyle = (status: string) => {
  switch(status) {
    case "completed":
      return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
    default:
      return "";
  }
};

// Function to get status text
const getStatusText = (status: string) => {
  switch(status) {
    case "completed":
      return "Completed";
    case "in-progress":
      return "In Progress";
    default:
      return "Pending";
  }
};

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
    setTodoStatus,
    handleOpenEditModal,
    deleteTodo
}) => (
    <tr className={`border-b transition-colors ${
      todo.status === "completed" ? "bg-muted/20" : 
      todo.status === "in-progress" ? "bg-blue-50/30" : ""
    }`}>
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

        {/* --- START DATE --- */}
        <td
            className="p-4 align-middle cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => handleOpenDetailSheet(todo)}
        >
            <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 opacity-70" />
                {formatDate(todo.startDate ?? "")}
            </span>
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

        {/* --- TIME --- */}
        <td
            className="p-4 align-middle cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => handleOpenDetailSheet(todo)}
        >
            <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 opacity-70" />
                {todo.time || "—"}
            </span>
        </td>

        <td
            className="p-4 align-middle cursor-pointer hover:bg-muted/30 transition-colors"
            onClick={() => handleOpenDetailSheet(todo)}
        >
            <Badge
                variant={todo.status === "pending" ? "outline" : "default"}
                className={getStatusBadgeStyle(todo.status)}
            >
                {getStatusText(todo.status)}
            </Badge>
        </td>
        <td className="p-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end gap-2">
                {/* Status change buttons */}
                {todo.status !== "in-progress" && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTodoStatus(todo.id, "in-progress")}
                        title="Mark as In Progress"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        <Play className="h-4 w-4" />
                    </Button>
                )}
                
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTodoStatus(todo.id)}
                    title={todo.status === "completed" ? "Mark as Pending" : "Mark as Completed"}
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