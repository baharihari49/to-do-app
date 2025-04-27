// TodoDetails.tsx
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/DateUtils';
import { getPriorityColor } from '@/utils/StyleUtils';
import { Todo } from '../Types';

interface TodoDetailsProps {
  todo: Todo;
}

export const TodoDetails: React.FC<TodoDetailsProps> = ({ todo }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Task Details</h3>
      
      <div className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-800 w-full">
        {todo.createdAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Created</span>
            <span className="text-sm font-medium">{formatDate(todo.createdAt, true)}</span>
          </div>
        )}
        
        {todo.updatedAt && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Last Updated</span>
            <span className="text-sm font-medium">{formatDate(todo.updatedAt, true)}</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Due Date</span>
          <span className="text-sm font-medium">{formatDate(todo.dueDate)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status</span>
          <Badge variant={todo.status === "completed" ? "default" : "outline"}
            className={todo.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : 'border-gray-200 text-gray-800'}>
            {todo.status === "completed" ? "Completed" : "Pending"}
          </Badge>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Priority</span>
          <Badge className={getPriorityColor(todo.priority)}>
            {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
          </Badge>
        </div>
      </div>
    </div>
  );
};