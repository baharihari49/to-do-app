import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Interface for StatCard props
interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
}

export const StatCard = ({ title, value, suffix = "" }: StatCardProps) => (
  <Card>
    <CardHeader className="p-4 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <p className="text-2xl font-bold">{value}{suffix}</p>
    </CardContent>
  </Card>
);