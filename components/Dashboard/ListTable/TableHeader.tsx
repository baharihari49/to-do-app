import { Todo, SelectedTodos } from "../Types";
import { Checkbox } from "@radix-ui/react-checkbox";

interface TableHeaderProps {
    handleSelectAll: (isChecked: boolean) => void;
    paginatedTodos: Todo[];
    selected: SelectedTodos;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ handleSelectAll, paginatedTodos, selected }) => (
    <tr className="border-b transition-colors hover:bg-muted/50">
        <th className="h-12 px-4 text-left align-middle font-medium">
            <Checkbox
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
                checked={
                    paginatedTodos.length > 0 &&
                    paginatedTodos.every(todo => selected[todo.id])
                }
            />
        </th>
        <th className="h-12 px-4 text-left align-middle font-medium">Task</th>
        <th className="h-12 px-4 text-left align-middle font-medium">Priority</th>
        <th className="h-12 px-4 text-left align-middle font-medium">Due Date</th>
        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
        <th className="h-12 px-4 text-right align-middle font-medium">Actions</th>
    </tr>
);
