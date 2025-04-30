// src/features/analytics/components/charts/CompletionTimeChart.tsx
import { 
    BarChart as RechartsBarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
  } from 'recharts';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
  import { CompletionTimeData } from '../../types';
  
  type CompletionTimeChartProps = {
    data: CompletionTimeData;
  };
  
  export const CompletionTimeChart = ({ data }: CompletionTimeChartProps) => {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Time to Completion</CardTitle>
          <CardDescription>
            How long it takes to complete tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72 pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              layout="vertical"
              barCategoryGap={12}
              margin={{
                top: 20,
                right: 30,
                left: 40,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
              <XAxis type="number" tickLine={false} />
              <YAxis
                dataKey="day"
                type="category"
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderColor: '#e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value) => [`${value} tasks`, 'Count']}
              />
              <Bar 
                dataKey="tasks" 
                name="Tasks" 
                fill="#10b981" 
                radius={[0, 4, 4, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };