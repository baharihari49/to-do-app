// types.ts - Unified type definitions for the Todo application

// Define the priority levels and status types for better type safety
export type PriorityLevel = 'high' | 'medium' | 'low';
export type TodoStatus = 'pending' | 'completed';
export type FilterType = 'all' | 'pending' | 'completed';
export type SortByType = 'dueDate' | 'priority';

// The core Todo item interface
export interface Todo {
  id: number;  // Must be a number (not null)
  title: string;
  description: string;
  status: TodoStatus;
  dueDate: string;
  priority: PriorityLevel;
}

// New Todo (no ID yet)
export interface NewTodo {
  title: string;
  description: string;
  status: TodoStatus;
  dueDate: string;
  priority: PriorityLevel;
}

// TodoForm Values (for form state)
export interface TodoFormValues {
  id?: number | null; // Optional for new todos
  title: string;
  description: string;
  dueDate: string;
  priority: PriorityLevel;
  status: TodoStatus;
}

// Overview component props
export interface OverviewProps {
  completedCount: number;
  todos: Todo[];
  completionRate: number;
  isOverdue: (dateString: string) => boolean;
}

// Selected todos state - a record of todo IDs and whether they're selected
export interface SelectedTodos {
  [key: number]: boolean;
}

// Modal dialog props
export interface ModalDialogProps {
  isEditing?: boolean;
  editingTodo?: Todo | null;
  trigger: React.ReactNode;
  onTaskSubmitted?: (todo: Todo) => void;
}

// Form add props
export interface FormAddProps {
  isEditing?: boolean;
  editingTodo?: Todo | null;
  onClose: () => void;
  onSubmit: (todo: TodoFormValues) => void;
}

// Props for the TodoDashboard component
export interface TodoDashboardProps {
  initialTodos?: Todo[];
}

// Function type definitions for the dashboard's main operations
export interface TodoOperations {
  toggleTodoStatus: (id: number) => void;
  deleteTodo: (id: number) => void;
  addTodo: (todo: NewTodo) => void;
  updateTodo: (id: number, updates: Partial<Todo>) => void;
  markSelectedAs: (status: TodoStatus) => void;
  deleteSelected: () => void;
}

// Table action props for the Actions column
export interface TodoActionProps {
  todo: Todo;
  onToggleStatus: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

// Pagination props
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

// Filter and sort props
export interface FilterSortProps {
  filter: FilterType;
  sortBy: SortByType;
  onFilterChange: (filter: FilterType) => void;
  onSortChange: (sortBy: SortByType) => void;
}

// Bulk action props
export interface BulkActionProps {
  selectedCount: number;
  onMarkAsCompleted: () => void;
  onDeleteSelected: () => void;
}

// Calendar date formatting utility interface
export interface DateFormatterOptions {
  month: 'long' | 'short' | 'narrow' | 'numeric' | '2-digit';
  day: 'numeric' | '2-digit';
  year?: 'numeric' | '2-digit';
}

// ListTable props
export interface ListTableProps {
  todos: Todo[];
  paginatedTodos: Todo[];
  sortedTodos: Todo[];
  selected: SelectedTodos;
  selectedCount: number;
  filter: FilterType;
  sortBy: SortByType;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setFilter: (filter: FilterType) => void;
  setSortBy: (sortBy: SortByType) => void;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  handleSelect: (id: number, isChecked: boolean) => void;
  handleSelectAll: (isChecked: boolean) => void;
  markSelectedAsCompleted: () => void;
  deleteSelected: () => void;
  toggleTodoStatus: (id: number) => void;
  deleteTodo: (id: number) => void;
  formatDate: (dateString: string) => string;
  getPriorityColor: (priority: PriorityLevel) => string;
  isOverdue: (dateString: string) => boolean;
  onTaskAdded?: (todo: Todo) => void;
}