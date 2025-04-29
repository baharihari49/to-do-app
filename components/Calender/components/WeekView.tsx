// components/WeekView.tsx
import { Todo, PriorityLevel } from '@/Types/Types';
import { getStatusStyle } from '../utils/styleUtils';
import { OwnerAvatar } from './OwnerAvatar';

interface WeekViewProps {
  weekDays: Date[];
  tasks: Todo[];
  filterTasks: (tasks: Todo[]) => Todo[];
  onTaskClick: (task: Todo) => void;
  onDateSelect: (date: Date) => void;
  getDatePartsInTimeZone: (dateString: string, timeZone?: string) => { year: number; month: number; day: number };
  isOverdue: (dateString: string) => boolean;
  getPriorityColor: (priority: PriorityLevel) => string;
}

export const WeekView = ({
  weekDays,
  tasks,
  filterTasks,
  onTaskClick,
  onDateSelect,
  isOverdue,
}: WeekViewProps) => {
  // Render week day header
  const renderWeekDayHeader = (date: Date, index: number) => {
    const isToday = new Date().toDateString() === date.toDateString();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div 
        key={index} 
        className={`p-2 border-t border-l font-medium text-center ${
          isToday ? 'bg-primary/10' : ''
        }`}
      >
        <div>{days[index]}</div>
        <div className={`text-sm mt-1 ${isToday ? 'font-bold' : 'text-muted-foreground'}`}>
          {date.getDate()}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-0 text-center border-b border-r">
        {weekDays.map((date, i) => renderWeekDayHeader(date, i))}
      </div>
      
      {/* Week view content */}
      <div className="grid grid-cols-7 gap-0 border-b border-r min-h-[500px]">
        {weekDays.map((date, i) => {
          const isToday = new Date().toDateString() === date.toDateString();
          
          // Get tasks for this day
          const tasksForDay = tasks.filter(task => {
            if (!task.startDate) return false;
            const taskDate = new Date(task.startDate);
            return taskDate.toDateString() === date.toDateString();
          });
          
          // Apply filters
          const filteredTasks = filterTasks(tasksForDay);
          
          return (
            <div 
              key={i} 
              className={`border-l p-2 overflow-y-auto ${
                isToday ? 'bg-primary/5' : ''
              }`}
              onClick={() => onDateSelect(date)}
            >
              {filteredTasks.length === 0 ? (
                <div className="text-xs text-muted-foreground text-center h-20 flex items-center justify-center">
                  No tasks
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:bg-muted/20 ${
                        getStatusStyle(task.status)
                      } ${
                        task.priority === 'high' ? 'border-l-2 border-destructive' : 
                        task.priority === 'medium' ? 'border-l-2 border-yellow-500' : ''
                      } ${
                        task.dueDate && isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-destructive' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {task.createdBy && (
                          <div className="flex-shrink-0 -ml-1 -mt-1">
                            <OwnerAvatar owner={task.createdBy} />
                          </div>
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};