// StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play } from 'lucide-react';

interface StatusBadgeProps {
  status: 'pending' | 'in-progress' | 'completed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border border-blue-200">
          <Play className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    case 'pending':
    default:
      return (
        <Badge variant="outline" className="bg-gray-100 border-gray-200 text-gray-800">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
  }
};