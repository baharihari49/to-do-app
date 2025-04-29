// TodoHeader.tsx
import { Calendar, Clock, Edit as EditIcon, Trash as TrashIcon, CheckCircle, XCircle, AlertCircle, Clock4, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, getDaysStatus } from '@/utils/DateUtils';
import { getPriorityColor } from '@/utils/StyleUtils';
import { StatusBadge } from './StatusBadge';
import { Todo } from '@/Types/Types';

interface TodoHeaderProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
  onToggleStatus?: (id: string | number) => void;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
}

export const TodoHeader: React.FC<TodoHeaderProps> = ({ 
  todo, 
  onEdit, 
  onToggleStatus,
  setIsDeleteDialogOpen
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

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1 pr-4">
          <h2 className="text-2xl font-bold tracking-tight">{todo.title}</h2>
          
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                Due: {formatDate(todo.dueDate)}
              </span>
            </div>
            
            <span className="text-gray-300">•</span>
            
            <div className={`flex items-center gap-1 text-sm font-medium ${
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
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onToggleStatus && onToggleStatus(todo.id)}
            variant={todo.status === 'completed' ? 'outline' : 'default'}
            size="sm"
            className={`gap-1 transition-all ${todo.status === 'completed' ? 'border-green-200 text-green-700 hover:bg-green-50' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          >
            {todo.status === 'completed' ? (
              <>
                <XCircle className="h-4 w-4" />
                <span>Mark Pending</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Mark Complete</span>
              </>
            )}
          </Button>
          
          <div className="flex">
            <Button
              onClick={() => onEdit && onEdit(todo)}
              variant="outline"
              size="icon"
              className="rounded-r-none border-r-0"
            >
              <EditIcon className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="rounded-l-none text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Priority and status badges in header */}
      <div className="flex gap-2 mt-4">
        <Badge className={getPriorityColor(todo.priority)}>
          <Tag className="h-3 w-3 mr-1" />
          {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
        </Badge>
        
        <StatusBadge status={todo.status} />
      </div>
    </div>
  );
};