'use client';

import { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  PlusCircle,
  Filter,
  Play
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { useCalendarTodos } from '@/hooks/useTodoCalendar';
import { Todo } from '@/Types/Types';
import { Create } from './Create/Create';
import { Edit } from '../Dashboard/Edit/Edit';
import { Detail } from '../Dashboard/Detail/Detail';

// Import our components
import { DayView } from './components/DayView';
import { WeekView } from './components/WeekView';
import { MonthView } from './components/MonthView';

import { PriorityLevel } from '@/Types/Types';

// Import our utilities
import { formatEnglishMonthDisplay } from './utils/dateUtils';

type CalendarViewType = 'month' | 'week' | 'day';
type FilterOptions = {
  priority: Record<PriorityLevel, boolean>;
  status: {
    pending: boolean;
    'in-progress': boolean;
    completed: boolean;
  };
};

const TodoCalendarView = () => {
  const {
    allTodos,
    isLoading,
    currentDate,
    currentMonth,
    currentYear,
    selectedDate,
    firstDayOfWeek,
    daysInMonth,
    setSelectedDate,
    setCurrentDate,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    getTasksForDate,
    deleteTodo,
    toggleTodoStatus,
    setTodoStatus,
    refetchTodos,
    getPriorityColor,
    isOverdue,
    getDatePartsInTimeZone
  } = useCalendarTodos();

  // State variables
  const [viewType, setViewType] = useState<CalendarViewType>('month');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    priority: {
      high: true,
      medium: true,
      low: true
    },
    status: {
      pending: true,
      'in-progress': true,
      completed: true
    }
  });

  // Function to toggle filter options
  const toggleFilter = (
    category: 'priority' | 'status',
    value: string
  ) => {
    setFilters(prev => {
      if (category === 'priority') {
        // Jika kategori adalah priority, kita tahu tipe datanya
        const priorityValue = value as PriorityLevel;
        return {
          ...prev,
          priority: {
            ...prev.priority,
            [priorityValue]: !prev.priority[priorityValue]
          }
        };
      } else if (category === 'status') {
        // Jika kategori adalah status, kita tahu tipe datanya
        const statusValue = value as 'pending' | 'in-progress' | 'completed';
        return {
          ...prev,
          status: {
            ...prev.status,
            [statusValue]: !prev.status[statusValue]
          }
        };
      }
      
      // Jika tidak masuk kondisi di atas, kembalikan state tidak berubah
      return prev;
    });
  };

  // Apply filters to tasks
  const filterTasks = (tasks: Todo[]): Todo[] => {
    return tasks.filter(task => {
      // Filter by priority
      const priorityMatch = filters.priority[task.priority];

      // Filter by status
      const statusMatch = filters.status[task.status as keyof typeof filters.status];

      return priorityMatch && statusMatch;
    });
  };

  // Calculate current week days (for week view)
  const weekDays = useMemo(() => {
    const result = [];
    // Get the start of the week (Sunday)
    let startDate: Date;

    if (selectedDate) {
      // If a date is selected, use that as reference for the week
      const day = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, ...
      startDate = new Date(selectedDate);
      startDate.setDate(selectedDate.getDate() - day); // Go back to Sunday
    } else {
      // Otherwise use current date
      const today = new Date();
      const day = today.getDay();
      startDate = new Date(today);
      startDate.setDate(today.getDate() - day);
    }

    // Generate days for the week (Sunday to Saturday)
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      result.push(date);
    }

    return result;
  }, [selectedDate]);

  // Get formatted week range for header
  const weekRangeText = useMemo(() => {
    if (weekDays.length === 0) return '';

    const startDay = weekDays[0];
    const endDay = weekDays[6];

    const formatShortDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    };

    return `${formatShortDate(startDay)} - ${formatShortDate(endDay)}`;
  }, [weekDays]);

  // Handle date click
  const handleDateClick = (day: number) => {
    setSelectedDayNumber(day);
    // Create a date object for the selected day in current month view
    const newSelectedDate = new Date(currentYear, currentMonth, day);
    setSelectedDate(newSelectedDate);

    // Switch to day view automatically when clicking on a date
    setViewType('day');
  };

  // Handle task click
  const handleTaskClick = (task: Todo) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  // Handle add task button click - without a specific date
  const handleAddTask = () => {
    setCreateModalOpen(true);
  };

  // Handle edit task
  const handleEditTask = (todo: Todo) => {
    setSelectedTask(todo);
    setEditModalOpen(true);
  };

  // Handle delete task
  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTodo(id);
      setDetailModalOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Handle set task status
  const handleSetTaskStatus = async (id: string | number, status: 'pending' | 'in-progress' | 'completed') => {
    try {
      await setTodoStatus(id, status);
      refetchTodos();
    } catch (error) {
      console.error(`Error setting task status to ${status}:`, error);
    }
  };

  // Open create modal with pre-filled date
  const handleAddTaskForSelectedDate = () => {
    setCreateModalOpen(true);
  };

  // Navigation for week view
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Navigation for day view
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
    setSelectedDate(newDate);
  };

  // Handle view change from tabs
  const handleViewChange = (value: string) => {
    setViewType(value as CalendarViewType);
  };

  // Prepare tasks for day view
  const getTasksForSelectedDay = () => {
    if (!selectedDate) return [];

    return filterTasks(allTodos.filter(task => {
      if (!task.startDate) return false;
      const taskDate = new Date(task.startDate);
      return taskDate.toDateString() === selectedDate.toDateString();
    }));
  };

  // Render navigation controls based on view type
  const renderNavigation = () => {
    switch (viewType) {
      case 'week':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousWeek}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-xl font-bold min-w-36 text-center">
              {weekRangeText}
            </h2>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextWeek}
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
        );

      case 'day':
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousDay}
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-xl font-bold min-w-36 text-center">
              {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : ''}
            </h2>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextDay}
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
        );

      case 'month':
      default:
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-xl font-bold min-w-36 text-center">
              {formatEnglishMonthDisplay(currentDate)}
            </h2>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
          </div>
        );
    }
  };

  // Render filter panel
  const renderFilterPanel = () => {
    // Count how many filters are active
    const activeFilterCount =
      (Object.values(filters.priority).filter(Boolean).length) +
      (Object.values(filters.status).filter(Boolean).length);

    // Total possible filters
    const totalFilters =
      Object.keys(filters.priority).length +
      Object.keys(filters.status).length;

    return (
      <Popover open={filterOpen} onOpenChange={setFilterOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1 relative"
          >
            <Filter className="h-4 w-4" />
            Filter
            {activeFilterCount < totalFilters && (
              <Badge
                variant="secondary"
                className="h-5 w-5 p-0 flex items-center justify-center absolute -top-2 -right-2 text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Filter Tasks</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => {
                  setFilters({
                    priority: {
                      high: true,
                      medium: true,
                      low: true
                    },
                    status: {
                      pending: true,
                      'in-progress': true,
                      completed: true
                    }
                  });
                }}
              >
                Reset
              </Button>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Priority</h5>
              <div className="space-y-1">
                {Object.keys(filters.priority).map(priority => (
                  <div key={priority} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority}`}
                      checked={filters.priority[priority as PriorityLevel]}
                      onCheckedChange={() => toggleFilter('priority', priority)}
                    />
                    <Label htmlFor={`priority-${priority}`} className="flex items-center">
                      <Badge className={getPriorityColor(priority as PriorityLevel)}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </Badge>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium">Status</h5>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-pending"
                    checked={filters.status.pending}
                    onCheckedChange={() => toggleFilter('status', 'pending')}
                  />
                  <Label htmlFor="status-pending">Pending</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-in-progress"
                    checked={filters.status['in-progress']}
                    onCheckedChange={() => toggleFilter('status', 'in-progress')}
                  />
                  <Label htmlFor="status-in-progress" className="flex items-center gap-1">
                    <Play className="h-3 w-3 text-blue-600" />
                    In Progress
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status-completed"
                    checked={filters.status.completed}
                    onCheckedChange={() => toggleFilter('status', 'completed')}
                  />
                  <Label htmlFor="status-completed">Completed</Label>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading calendar...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {renderNavigation()}

        <div className="flex gap-2">
          <Button
            variant="default"
            size="sm"
            className="gap-1"
            onClick={handleAddTask}
          >
            <PlusCircle className="h-4 w-4" />
            New Task
          </Button>

          {renderFilterPanel()}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Print Calendar
              </DropdownMenuItem>
              <DropdownMenuItem>
                Export Events
              </DropdownMenuItem>
              <DropdownMenuItem>
                Calendar Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs for View Selection */}
      <Tabs value={viewType} onValueChange={handleViewChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="day" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Day
          </TabsTrigger>
          <TabsTrigger value="week" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Week
          </TabsTrigger>
          <TabsTrigger value="month" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Month
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="mt-0">
          <DayView
            selectedDate={selectedDate || currentDate}
            tasks={getTasksForSelectedDay()}
            onAddTask={handleAddTaskForSelectedDate}
            onTaskClick={handleTaskClick}
            onStatusChange={handleSetTaskStatus}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>

        <TabsContent value="week" className="mt-0">
          <WeekView
            weekDays={weekDays}
            tasks={allTodos}
            filterTasks={filterTasks}
            onTaskClick={handleTaskClick}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setCurrentDate(date);
            }}
            getDatePartsInTimeZone={getDatePartsInTimeZone}
            isOverdue={isOverdue}
            getPriorityColor={getPriorityColor}
          />
        </TabsContent>

        <TabsContent value="month" className="mt-0">
          <MonthView
            currentMonth={currentMonth}
            currentYear={currentYear}
            firstDayOfWeek={firstDayOfWeek}
            daysInMonth={daysInMonth}
            getTasksForDate={getTasksForDate}
            filterTasks={filterTasks}
            isOverdue={isOverdue}
            getPriorityColor={getPriorityColor}
            onDateClick={handleDateClick}
            onTaskClick={handleTaskClick}
            selectedDayNumber={selectedDayNumber}
            getDatePartsInTimeZone={getDatePartsInTimeZone}
          />
        </TabsContent>
      </Tabs>

      {/* Create Task Modal - Pass the selected date */}
      <Create
        open={createModalOpen}
        setOpen={setCreateModalOpen}
        selectedDate={selectedDate}
      />

      {/* Edit Task Modal */}
      {selectedTask && (
        <Edit
          open={editModalOpen}
          setOpen={setEditModalOpen}
          todo={selectedTask}
        />
      )}

      {/* Task Detail Component */}
      {selectedTask && (
        <Detail
          todo={selectedTask}
          open={detailModalOpen}
          setOpen={setDetailModalOpen}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleStatus={toggleTodoStatus}
          fetchTodos={refetchTodos}
        />
      )}
    </div>
  );
};

export default TodoCalendarView;