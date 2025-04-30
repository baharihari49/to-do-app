// src/features/analytics/components/charts/CompletionRateChart.tsx
import { 
    PieChart as RechartsPieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    ResponsiveContainer 
  } from 'recharts';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
  import { CompletionRateData } from '../../types';
  
  type CompletionRateChartProps = {
    data: CompletionRateData;
  };
  
  export const CompletionRateChart = ({ data }: CompletionRateChartProps) => {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Completion Rate</CardTitle>
          <CardDescription>
            Percentage of completed vs. pending tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72 pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                strokeWidth={1}
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
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };
  