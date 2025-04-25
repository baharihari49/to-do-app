import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ListTodo, CheckCircle2, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';
import React from 'react';

interface Todo {
    id: number;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    priority: string;
}

interface OverviewProps {
    completedCount: number;
    todos: Todo[];
    completionRate: number;
    isOverdue: (dateString: string) => boolean;
}

export const Overview: React.FC<OverviewProps> = ({
    completedCount,
    todos,
    completionRate,
    isOverdue
}) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Total Tasks</h3>
                    <ListTodo className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{todos.length}</div>
                    <p className="text-xs text-muted-foreground">
                        {completedCount} completed, {todos.length - completedCount} pending
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Completion Rate</h3>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{completionRate}%</div>
                    <Progress value={completionRate} className="h-2 mt-2" />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Due Today</h3>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {todos.filter(todo => {
                            const today = new Date().toISOString().split('T')[0];
                            return todo.dueDate === today && todo.status === "pending";
                        }).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Tasks that need attention today
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="text-sm font-medium">Overdue</h3>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                        {todos.filter(todo => 
                            isOverdue(todo.dueDate) && todo.status === "pending"
                        ).length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Tasks past their due date
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}