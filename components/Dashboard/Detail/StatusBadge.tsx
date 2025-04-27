// StatusBadge.tsx
import { CheckCircle, Clock4 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Get the status icon
  const getStatusIcon = (status: string) => {
    return status === 'completed' 
      ? <CheckCircle className="h-4 w-4 text-green-500" /> 
      : <Clock4 className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Badge 
      variant={status === 'completed' ? 'default' : 'outline'} 
      className={status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : 'border-gray-200 text-gray-800'}
    >
      {getStatusIcon(status)}
      <span className="ml-1">
        {status === 'completed' ? 'Completed' : 'Pending'}
      </span>
    </Badge>
  );
};