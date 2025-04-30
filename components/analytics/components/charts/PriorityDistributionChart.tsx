// src/features/analytics/components/charts/PriorityDistributionChart.tsx
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PriorityDistributionData } from '../../types';

type PriorityDistributionChartProps = {
  data: PriorityDistributionData;
};

export const PriorityDistributionChart = ({ data }: PriorityDistributionChartProps) => {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Priority Distribution</CardTitle>
        <CardDescription>
          Breakdown of tasks by priority level
        </CardDescription>
      </CardHeader>
      <CardContent className="h-80 pt-6">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label={({ name, value, percent }) => 
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
              labelLine={{ stroke: "#d1d5db", strokeWidth: 1 }}
              strokeWidth={2}
              stroke="#ffffff"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value) => [`${value} tasks`, 'Count']}
            />
            <Legend 
              iconType="circle" 
              iconSize={10}
              wrapperStyle={{ 
                paddingTop: 20,
                fontSize: '14px',
              }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};