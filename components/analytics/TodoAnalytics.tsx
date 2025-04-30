// src/features/analytics/TodoAnalytics.tsx
'use client'

import { useState } from 'react';
import { 
  BarChart, 
  Calendar, 
  ChevronDown, 
  PieChart, 
  TrendingUp 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTodos } from '@/hooks/useTodos';
import { TimeRange, ChartTab } from './types';
import { formatTimeRange } from './utils';
import { useAnalyticsData } from './hooks';
import { OverviewCard } from './components';
import { 
  ActivityChart, 
  CompletionRateChart, 
  CompletionTimeChart, 
  PriorityDistributionChart 
} from './components/charts';

const TodoAnalytics = () => {
  const { 
    allTodos, 
    overviewStats, 
    isLoadingAllTodos,
    isOverdue
  } = useTodos();
  
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [chartTab, setChartTab] = useState<ChartTab>('activity');
  
  const {
    activityData,
    completionRateData,
    priorityDistributionData,
    completionTimeData,
    averageCompletionTime
  } = useAnalyticsData(allTodos, overviewStats, timeRange, isOverdue);
  
  // Loading state
  if (isLoadingAllTodos) {
    return <div className="h-96 flex items-center justify-center">Loading analytics data...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your task completion statistics and productivity trends
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              {formatTimeRange(timeRange)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTimeRange('7d')} className="cursor-pointer">
              Last 7 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange('30d')} className="cursor-pointer">
              Last 30 Days
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange('90d')} className="cursor-pointer">
              Last 3 Months
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange('1y')} className="cursor-pointer">
              Last Year
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <OverviewCard
          title="Total Tasks"
          value={overviewStats.totalCount}
          icon={<BarChart className="h-4 w-4 text-blue-500" />}
          trend={<TrendingUp className="h-3 w-3 mr-1" />}
          trendValue={overviewStats.totalCount > 0 ? '+12% from previous period' : 'No tasks yet'}
        />
        
        <OverviewCard
          title="Completion Rate"
          value={`${overviewStats.completionRate.toFixed(0)}%`}
          icon={<PieChart className="h-4 w-4 text-emerald-500" />}
          trend={<TrendingUp className="h-3 w-3 mr-1" />}
          trendValue={overviewStats.completedCount > 0 ? '+5% from previous period' : 'No completed tasks yet'}
        />
        
        <OverviewCard
          title="Average Completion Time"
          value={`${averageCompletionTime} days`}
          icon={<Calendar className="h-4 w-4 text-amber-500" />}
          trend={<TrendingUp className="h-3 w-3 mr-1" />}
          trendValue={averageCompletionTime > 0 ? '-0.5 days from previous period' : 'No completed tasks yet'}
        />
        
        <OverviewCard
          title="Productivity Score"
          value={overviewStats.completedCount > 0
            ? `${Math.min(100, Math.round(overviewStats.completionRate + (100 - overviewStats.overdueCount / overviewStats.totalCount * 100) / 2))}/100`
            : 'N/A'}
          icon={<TrendingUp className="h-4 w-4 text-purple-500" />}
          trend={<TrendingUp className="h-3 w-3 mr-1" />}
          trendValue={overviewStats.completedCount > 0 ? '+8 points from previous period' : 'No tasks completed yet'}
        />
      </div>
      
      {/* Chart Tabs */}
      <Tabs defaultValue={chartTab} onValueChange={(value) => setChartTab(value as ChartTab)} className="mt-6">
        <TabsList>
          <TabsTrigger value="activity">
            <BarChart className="h-4 w-4 mr-2 inline-block text-blue-500" />
            Activity Trends
          </TabsTrigger>
          <TabsTrigger value="completion">
            <PieChart className="h-4 w-4 mr-2 inline-block text-emerald-500" />
            Completion Analysis
          </TabsTrigger>
          <TabsTrigger value="priority">
            <TrendingUp className="h-4 w-4 mr-2 inline-block text-amber-500" />
            Priority Distribution
          </TabsTrigger>
        </TabsList>
        
        {/* Activity Chart */}
        <TabsContent value="activity" className="space-y-4">
          <ActivityChart data={activityData} />
        </TabsContent>
        
        {/* Completion Analysis */}
        <TabsContent value="completion" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CompletionRateChart data={completionRateData} />
            <CompletionTimeChart data={completionTimeData} />
          </div>
        </TabsContent>
        
        {/* Priority Distribution */}
        <TabsContent value="priority">
          <PriorityDistributionChart data={priorityDistributionData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TodoAnalytics;