import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Play, CheckCircle2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface TaskStatusActionsProps {
  status: string;
  onStatusChange: (status: 'pending' | 'in-progress' | 'completed') => void;
}

export const TaskStatusActions = ({ status, onStatusChange }: TaskStatusActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2">
          <StatusBadge status={status} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Set Status</DropdownMenuLabel>
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => onStatusChange('pending')}
        >
          Pending
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => onStatusChange('in-progress')}
        >
          <Play className="h-4 w-4 mr-2 text-blue-600" />
          In Progress
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={() => onStatusChange('completed')}
        >
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
          Completed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};