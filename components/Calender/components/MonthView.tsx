// components/MonthView.tsx
import { Badge } from '@/components/ui/badge';
import { Todo, PriorityLevel } from '@/Types/Types';
import { getStatusStyle } from '../utils/styleUtils';
import { OwnerAvatar } from './OwnerAvatar';

interface MonthViewProps {
  currentMonth: number;
  currentYear: number;
  firstDayOfWeek: number;
  daysInMonth: number;
  getTasksForDate: (day: number) => Todo[];
  filterTasks: (tasks: Todo[]) => Todo[];
  isOverdue: (dateString: string) => boolean;
  getPriorityColor: (priority: PriorityLevel) => string;
  onDateClick: (day: number) => void;
  onTaskClick: (task: Todo) => void;
  selectedDayNumber: number | null;
  getDatePartsInTimeZone: (dateString: string, timeZone?: string) => { year: number; month: number; day: number };
}

export const MonthView = ({
  currentMonth,
  currentYear,
  firstDayOfWeek,
  daysInMonth,
  getTasksForDate,
  filterTasks,
  isOverdue,
  onDateClick,
  onTaskClick,
  selectedDayNumber,
  getDatePartsInTimeZone
}: MonthViewProps) => {
  // Generate calendar grid for month view
  const renderCalendarDays = () => {
    const days = [];
    
    // Get today's date in Jakarta timezone
    const now = new Date();
    const jakartaToday = getDatePartsInTimeZone(now.toISOString(), 'Asia/Jakarta');
    const isCurrentMonth = 
      jakartaToday.month === currentMonth && 
      jakartaToday.year === currentYear;
    const currentDay = jakartaToday.day;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="p-2 border bg-muted/20 h-28 md:h-32"
        ></div>
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      // Get tasks for this day and apply filters
      const tasksForDay = getTasksForDate(day);
      const filteredTasks = filterTasks(tasksForDay);
      
      const hasHighPriorityTask = filteredTasks.some(task => task.priority === 'high');
      const hasOverdueTask = filteredTasks.some(task => task.dueDate && isOverdue(task.dueDate) && task.status !== 'completed');
      const hasInProgressTask = filteredTasks.some(task => task.status === 'in-progress');
      
      days.push(
        <div 
          key={day} 
          className={`p-2 border relative h-28 md:h-32 overflow-hidden hover:bg-muted/10 transition-colors ${
            isCurrentMonth && day === currentDay ? 'bg-primary/5 border-primary/50' : ''
          } ${
            selectedDayNumber === day ? 'ring-1 ring-primary' : ''
          }`}
          onClick={() => onDateClick(day)}
        >
          <div className="flex justify-between items-start">
            <span className={`inline-block w-6 h-6 rounded-full text-center ${
              isCurrentMonth && day === currentDay ? 'bg-primary text-primary-foreground' : ''
            }`}>
              {day}
            </span>
            
            {filteredTasks.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {filteredTasks.length}
              </Badge>
            )}
          </div>
          
          <div className="mt-1 space-y-1">
            {filteredTasks.slice(0, 3).map(task => (
              <div 
                key={task.id}
                className={`text-xs p-1 rounded cursor-pointer ${
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
            
            {filteredTasks.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{filteredTasks.length - 3} more
              </div>
            )}
          </div>
          
          {/* Task indicators */}
          <div className="absolute top-1 right-1 flex gap-1">
            {hasHighPriorityTask && (
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
            )}
            {hasOverdueTask && (
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            )}
            {hasInProgressTask && (
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            )}
          </div>
        </div>
      );
    }
    
    return days;
  };

  return (
    <div>
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0 text-center font-medium border-b border-l border-r">
        <div className="p-2 border-t">Sun</div>
        <div className="p-2 border-t border-l">Mon</div>
        <div className="p-2 border-t border-l">Tue</div>
        <div className="p-2 border-t border-l">Wed</div>
        <div className="p-2 border-t border-l">Thu</div>
        <div className="p-2 border-t border-l">Fri</div>
        <div className="p-2 border-t border-l">Sat</div>
      </div>
      
      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-0">
        {renderCalendarDays()}
      </div>
    </div>
  );
};