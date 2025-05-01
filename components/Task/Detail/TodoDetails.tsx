// TodoDetails.tsx
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/DateUtils';
import { getPriorityColor } from '@/utils/StyleUtils';
import { Todo } from '@/Types/Types';
import { CheckCircle, Clock, Play } from 'lucide-react';

interface TodoDetailsProps {
  todo: Todo;
}

export const TodoDetails: React.FC<TodoDetailsProps> = ({ todo }) => {
  const getStatusDetails = () => {
    switch (todo.status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-600 mr-1" />,
          text: 'Completed',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'in-progress':
        return {
          icon: <Play className="h-4 w-4 text-blue-600 mr-1" />,
          text: 'In Progress',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'pending':
      default:
        return {
          icon: <Clock className="h-4 w-4 text-gray-500 mr-1" />,
          text: 'Pending',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const statusDetails = getStatusDetails();

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
          <span className="text-sm text-gray-500">Start Date</span>
          <span className="text-sm font-medium">{formatDate(todo.startDate)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Due Date</span>
          <span className="text-sm font-medium">{formatDate(todo.dueDate)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Time</span>
          <span className="text-sm font-medium">{todo.time}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Status</span>
          <div className="flex items-center">
            {statusDetails.icon}
            <span className="text-sm font-medium">{statusDetails.text}</span>
          </div>
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