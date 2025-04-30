// src/features/analytics/components/OverviewCard.tsx
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type OverviewCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend: ReactNode;
  trendValue: string;
};

export const OverviewCard = ({ title, value, icon, trend, trendValue }: OverviewCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-green-600 flex items-center">
          {trend}
          {trendValue}
        </p>
      </CardContent>
    </Card>
  );
};
