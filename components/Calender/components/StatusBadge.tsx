import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  switch(status) {
    case 'completed':
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Completed</Badge>;
    case 'in-progress':
      return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">In Progress</Badge>;
    default:
      return <Badge variant="outline">Pending</Badge>;
  }
};