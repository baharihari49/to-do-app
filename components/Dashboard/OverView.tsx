// components/Dashboard/Overview.tsx
import { 
    CheckCircle, 
    AlertTriangle, 
    Activity,
    Play
  } from 'lucide-react';
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Todo } from '@/Types/Types';
  import { cn } from '@/lib/utils'; // Import cn utility
  
  interface OverviewProps {
    completedCount: number;
    completionRate: number;
    overdueCount?: number;
    pendingCount?: number;
    inProgressCount?: number;
    totalCount?: number;
    isOverdue?: (todo: Todo) => boolean;
  }
  
  export function Overview({
    completedCount,
    completionRate,
    overdueCount = 0,
    inProgressCount = 0,
    totalCount = 0,
  }: OverviewProps) {
    // Format completion rate to 1 decimal place
    const formattedCompletionRate = completionRate ? completionRate.toFixed(1) : "0.0";
    
    // Determine progress bar color based on completion rate
    const progressColor = 
      completionRate < 30 ? "bg-red-500" : 
      completionRate < 70 ? "bg-yellow-500" : 
      "bg-green-500";
    
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              out of {totalCount} tasks
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formattedCompletionRate}%</div>
            <div className="w-full mt-2">
              {/* Custom progress bar dengan styling warna dinamis */}
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={cn("h-full rounded-full", progressColor)} 
                  style={{ width: `${Math.min(completionRate, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              In Progress
            </CardTitle>
            <Play className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">
              tasks currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overdue
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              tasks past due date
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }