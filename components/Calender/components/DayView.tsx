import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock } from 'lucide-react';
import { Todo, PriorityLevel } from '@/Types/Types';
import { formatEnglishDate } from '../utils/dateUtils';
import { OwnerAvatar } from './OwnerAvatar';
import { TaskStatusActions } from './TaskStatusActions';

interface DayViewProps {
  selectedDate: Date;
  tasks: Todo[];
  onAddTask: () => void;
  onTaskClick: (task: Todo) => void;
  onStatusChange: (id: string | number, status: 'pending' | 'in-progress' | 'completed') => void;
  getPriorityColor: (priority: PriorityLevel) => string;
}

export const DayView = ({
  selectedDate,
  tasks,
  onAddTask,
  onTaskClick,
  onStatusChange,
  getPriorityColor
}: DayViewProps) => {
  if (!selectedDate) return null;
  
  // Sort tasks by time if available
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return 0;
  });
  
  // Group tasks by time
  const timeSlots: Record<string, Todo[]> = {};
  const noTimeSlot: Todo[] = [];
  
  sortedTasks.forEach(task => {
    if (task.time) {
      if (!timeSlots[task.time]) {
        timeSlots[task.time] = [];
      }
      timeSlots[task.time].push(task);
    } else {
      noTimeSlot.push(task);
    }
  });
  
  return (
    <Card className="mt-4">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-medium">{formatEnglishDate(selectedDate)}</h3>
          <p className="text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button size="sm" className="gap-1" onClick={onAddTask}>
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      <ScrollArea className="h-[600px]">
        {tasks.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No tasks scheduled for today
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Tasks with time */}
            {Object.keys(timeSlots).sort().map(time => (
              <div key={time} className="border-l-2 border-primary pl-2">
                <div className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {time}
                </div>
                <div className="space-y-2">
                  {timeSlots[time].map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-muted/20 ${
                        task.status === 'completed' ? 'bg-muted/30' : 
                        task.status === 'in-progress' ? 'bg-blue-50/30' : 'bg-card'
                      } border ${
                        task.status === 'in-progress' ? 'border-blue-200' : ''
                      }`}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex justify-between items-start">
                        <div className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                          <h4 className="font-medium flex items-center gap-2">
                            {task.title}
                            {task.status === 'in-progress' && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">In Progress</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                          
                          {task.createdBy && (
                            <div className="flex items-center gap-2 mt-2">
                              <OwnerAvatar owner={task.createdBy} />
                              <span className="text-xs text-muted-foreground">{task.createdBy.name}</span>
                            </div>
                          )}
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === 'high' ? 'High' : 
                           task.priority === 'medium' ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <TaskStatusActions 
                          status={task.status} 
                          onStatusChange={(status) => onStatusChange(task.id, status)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Tasks without time */}
            {noTimeSlot.length > 0 && (
              <div className="border-l-2 border-muted-foreground pl-2">
                <div className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  No Time Set
                </div>
                <div className="space-y-2">
                  {noTimeSlot.map(task => (
                    <div
                      key={task.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-muted/20 ${
                        task.status === 'completed' ? 'bg-muted/30' : 
                        task.status === 'in-progress' ? 'bg-blue-50/30' : 'bg-card'
                      } border ${
                        task.status === 'in-progress' ? 'border-blue-200' : ''
                      }`}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex justify-between items-start">
                        <div className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                          <h4 className="font-medium flex items-center gap-2">
                            {task.title}
                            {task.status === 'in-progress' && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">In Progress</Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                          
                          {task.createdBy && (
                            <div className="flex items-center gap-2 mt-2">
                              <OwnerAvatar owner={task.createdBy} />
                              <span className="text-xs text-muted-foreground">{task.createdBy.name}</span>
                            </div>
                          )}
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority === 'high' ? 'High' : 
                           task.priority === 'medium' ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <TaskStatusActions 
                          status={task.status} 
                          onStatusChange={(status) => onStatusChange(task.id, status)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};