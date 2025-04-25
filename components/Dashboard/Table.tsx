import React from 'react';
import {
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Filter,
    MoreHorizontal,
    Plus,
    ListTodo,
    Trash
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { ModalDialog } from '../Modal/Modal';

import { ListTableProps, FilterType, SortByType } from '../Dashboard/Types';

export const ListTable: React.FC<ListTableProps> = ({
    paginatedTodos,
    sortedTodos,
    selected,
    selectedCount,
    filter,
    sortBy,
    currentPage,
    totalPages,
    itemsPerPage,
    setFilter,
    setSortBy,
    setCurrentPage,
    handleSelect,
    handleSelectAll,
    markSelectedAsCompleted,
    deleteSelected,
    toggleTodoStatus,
    deleteTodo,
    formatDate,
    getPriorityColor,
    isOverdue,
    onTaskAdded
}) => {
    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <ModalDialog
                        trigger={
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                            </Button>
                        }
                        onTaskSubmitted={onTaskAdded}
                    />

                    {selectedCount > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {selectedCount} selected
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={markSelectedAsCompleted}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Mark as completed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="cursor-pointer text-destructive"
                                    onClick={deleteSelected}
                                >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete selected
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <Select
                        value={filter}
                        onValueChange={(value: string) => setFilter(value as FilterType)}
                    >
                        <SelectTrigger className="w-32">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Filter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Tasks</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={sortBy}
                        onValueChange={(value: string) => setSortBy(value as SortByType)}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dueDate">Due Date</SelectItem>
                            <SelectItem value="priority">Priority</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-card rounded-lg border shadow-sm">
                {/* Tasks Table */}
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead>
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium">
                                    <Checkbox
                                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        checked={
                                            paginatedTodos.length > 0 &&
                                            paginatedTodos.every(todo => selected[todo.id])
                                        }
                                    />
                                </th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Task</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Priority</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Due Date</th>
                                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                                <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTodos.map((todo) => (
                                <tr
                                    key={todo.id}
                                    className={`border-b transition-colors hover:bg-muted/50 ${
                                        todo.status === "completed" ? "bg-muted/20" : ""
                                    }`}
                                >
                                    <td className="p-4 align-middle">
                                        <Checkbox
                                            checked={selected[todo.id] || false}
                                            onCheckedChange={(checked) => handleSelect(todo.id, !!checked)}
                                        />
                                    </td>
                                    <td className="p-4 align-middle font-medium">
                                        <div className="flex flex-col">
                                            <span className={todo.status === "completed" ? "line-through text-muted-foreground" : ""}>
                                                {todo.title}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate max-w-64">
                                                {todo.description}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Badge className={`${getPriorityColor(todo.priority)}`}>
                                            {todo.priority}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <span className={`flex items-center gap-1 ${
                                            isOverdue(todo.dueDate) && todo.status !== "completed"
                                                ? "text-destructive font-medium"
                                                : ""
                                        }`}>
                                            <Calendar className="h-4 w-4" />
                                            {formatDate(todo.dueDate)}
                                        </span>
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Badge variant={todo.status === "completed" ? "secondary" : "outline"}>
                                            {todo.status === "completed" ? "Completed" : "Pending"}
                                        </Badge>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleTodoStatus(todo.id)}
                                            >
                                                <CheckCircle2 className={`h-4 w-4 ${
                                                    todo.status === "completed" ? "text-primary" : "text-muted-foreground"
                                                }`} />
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="cursor-pointer text-destructive"
                                                        onClick={() => deleteTodo(todo.id)}
                                                    >
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {paginatedTodos.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                                            <ListTodo className="h-8 w-8 mb-2" />
                                            <p>No tasks found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing {(currentPage - 1) * itemsPerPage + 1}-
                            {Math.min(currentPage * itemsPerPage, sortedTodos.length)} of {sortedTodos.length}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="icon"
                                    onClick={() => setCurrentPage(page)}
                                    className="h-8 w-8"
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};