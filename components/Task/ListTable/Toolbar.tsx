import { FilterType, SortByType, } from "@/Types/Types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, CheckCircle2, Trash, Filter, Search, Loader2 } from "lucide-react";
import { Create } from "../Create/Create";
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
import { SetStateAction } from "react";

interface ToolbarProps {
    handleOpenCreateModal: (value?: boolean) => void;
    isCreateModalOpen: boolean;
    selectedCount: number;
    markSelectedAsCompleted: () => void;
    deleteSelected: () => void;
    filter: FilterType;
    setFilter: (filter: FilterType) => void;
    sortBy: SortByType;
    setSortBy: (sortBy: SortByType) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isSearching?: boolean; // Optional prop untuk status pencarian
}

// Komponen untuk toolbar bagian atas
export const Toolbar: React.FC<ToolbarProps> = ({
    handleOpenCreateModal,
    isCreateModalOpen,
    selectedCount,
    markSelectedAsCompleted,
    deleteSelected,
    filter,
    setFilter,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    isSearching = false
}) => (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap md:w-2/3">
            {/* Tombol Add Task */}
            <Button
                variant="default"
                className="flex items-center"
                onClick={() => handleOpenCreateModal()}
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
            </Button>

            {/* Modal Create - Simplified props */}
            <Create
                open={isCreateModalOpen}
                setOpen={(value: SetStateAction<boolean>) => {
                    // Konversi SetStateAction<boolean> menjadi boolean
                    const newValue = typeof value === 'function'
                        ? value(isCreateModalOpen)
                        : value;

                    handleOpenCreateModal(newValue);
                }}
            />
            
            {/* Search Box dengan Indikator */}
            <div className="relative flex-grow max-w-md">
                {isSearching ? (
                    <Loader2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground animate-spin" />
                ) : (
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                    type="search"
                    placeholder="Search tasks..."
                    className="pl-8 bg-muted/50 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button 
                        className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearchQuery('')}
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>
            
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
);