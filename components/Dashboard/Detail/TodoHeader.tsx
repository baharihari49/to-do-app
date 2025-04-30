// TodoHeader.tsx
import { Calendar, Clock, Edit as EditIcon, Trash as TrashIcon, CheckCircle, XCircle, AlertCircle, Clock4, Tag, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getDaysStatus } from '@/utils/DateUtils';
import { getPriorityColor } from '@/utils/StyleUtils';
import { StatusBadge } from './StatusBadge';
import { Todo } from '@/Types/Types';

interface TodoHeaderProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
  onToggleStatus?: (id: number) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  onSetStatus?: (id: number, status: 'pending' | 'in-progress' | 'completed') => void;
}

export const TodoHeader: React.FC<TodoHeaderProps> = ({ 
  todo, 
  onEdit, 
  onToggleStatus,
  setIsDeleteDialogOpen,
  onSetStatus
}) => {
  const daysStatus = getDaysStatus(todo.dueDate, todo.status);
  
  // Get the icon based on the status type from daysStatus
  const getStatusIcon = () => {
    switch(daysStatus.icon) {
      case 'alertCircle': return <AlertCircle className="h-4 w-4" />;
      case 'clock': return <Clock className="h-4 w-4" />;
      case 'clock4': return <Clock4 className="h-4 w-4" />;
      case 'checkSquare': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock4 className="h-4 w-4" />;
    }
  };

  // Render status action buttons based on current status - optimized for mobile
  const renderStatusActions = () => {
    switch(todo.status) {
      case 'completed':
        return (
          <Button 
            onClick={() => onSetStatus ? onSetStatus(todo.id, 'pending') : (onToggleStatus && onToggleStatus(todo.id))}
            variant="outline"
            size="sm"
            className="gap-1 border-green-200 text-green-700 hover:bg-green-50 transition-all text-xs sm:text-sm"
          >
            <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sm:inline">Mark Pending</span>
          </Button>
        );
      
      case 'in-progress':
        return (
          <Button 
            onClick={() => onSetStatus && onSetStatus(todo.id, 'completed')}
            variant="default"
            size="sm"
            className="gap-1 bg-green-600 hover:bg-green-700 text-white transition-all text-xs sm:text-sm"
          >
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sm:inline">Mark Complete</span>
          </Button>
        );
      
      case 'pending':
      default:
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => onSetStatus && onSetStatus(todo.id, 'in-progress')}
              variant="default"
              size="sm"
              className="gap-1 bg-blue-600 hover:bg-blue-700 text-white transition-all text-xs sm:text-sm"
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sm:inline">Mark In-Progress</span>
            </Button>
            
            <Button 
              onClick={() => onSetStatus ? onSetStatus(todo.id, 'completed') : (onToggleStatus && onToggleStatus(todo.id))}
              variant="default"
              size="sm"
              className="gap-1 bg-green-600 hover:bg-green-700 text-white transition-all text-xs sm:text-sm"
            >
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sm:inline">Mark Complete</span>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="mb-4 sm:mb-6">
      {/* Title and action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-1 pr-0 sm:pr-4">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{todo.title}</h2>
          
          {/* Due date and status */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-500">
                Due: {formatDate(todo.dueDate)}
              </span>
            </div>
            
            <span className="text-gray-300 hidden sm:inline">•</span>
            
            <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${
              daysStatus.type === 'error' ? 'text-red-500' : 
              daysStatus.type === 'warning' ? 'text-yellow-500' : 
              daysStatus.type === 'success' ? 'text-green-500' : 
              'text-blue-500'
            }`}>
              {getStatusIcon()}
              <span>{daysStatus.text}</span>
            </div>
          </div>
        </div>
        
        {/* Edit and delete buttons - move to bottom on mobile */}
        <div className="flex justify-between sm:justify-end gap-2 order-3 sm:order-2 mt-2 sm:mt-0">
          {/* Priority and status badges */}
          <div className="flex gap-2 sm:hidden">
            <Badge className={`text-xs ${getPriorityColor(todo.priority)}`}>
              <Tag className="h-3 w-3 mr-1" />
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </Badge>
            
            <StatusBadge status={todo.status} />
          </div>
          
          <div className="flex">
            <Button
              onClick={() => onEdit && onEdit(todo)}
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-r-none border-r-0"
            >
              <EditIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-l-none text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        
        {/* Status action buttons */}
        <div className="flex-1 sm:flex-none order-2 sm:order-3">
          {renderStatusActions()}
        </div>
      </div>
      
      {/* Priority and status badges - visible on larger screens */}
      <div className="hidden sm:flex gap-2 mt-4">
        <Badge className={getPriorityColor(todo.priority)}>
          <Tag className="h-3 w-3 mr-1" />
          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
        </Badge>
        
        <StatusBadge status={todo.status} />
      </div>
    </div>
  );
};