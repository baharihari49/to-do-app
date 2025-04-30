// src/features/analytics/components/charts/ActivityChart.tsx
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
  } from 'recharts';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
  import { ActivityData } from '../../types';
  
  type ActivityChartProps = {
    data: ActivityData;
  };
  
  export const ActivityChart = ({ data }: ActivityChartProps) => {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Task Activity</CardTitle>
          <CardDescription>
            Number of tasks created vs. completed over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-96 pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="label"
                tickLine={false}
              />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="created"
                name="Tasks Created"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4, fill: "#3b82f6", strokeWidth: 1, stroke: "white" }}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "white", strokeWidth: 1 }}
              />
              <Line
                type="monotone"
                dataKey="completed"
                name="Tasks Completed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 1, stroke: "white" }}
                activeDot={{ r: 6, fill: "#10b981", stroke: "white", strokeWidth: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };
  