export type TimeRange = '7d' | '30d' | '90d' | '1y';
export type ChartTab = 'activity' | 'completion' | 'priority';

export type ActivityData = Array<{
  label: string;
  created: number;
  completed: number;
}>;

export type CompletionRateData = Array<{
  name: string;
  value: number;
  color: string;
}>;

export type PriorityDistributionData = Array<{
  name: string;
  value: number;
  color: string;
}>;

export type CompletionTimeData = Array<{
  day: string;
  tasks: number;
}>;

export interface OverviewStats {
  completedCount: number;
  totalCount: number;
  completionRate: number;
  overdueCount: number;
  pendingCount: number;
  inProgressCount: number;
}