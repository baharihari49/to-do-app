// TodoDescription.tsx
import { SquarePen } from 'lucide-react';

interface TodoDescriptionProps {
  description: string;
}

export const TodoDescription: React.FC<TodoDescriptionProps> = ({ description }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <SquarePen className="h-4 w-4 text-gray-500" />
        Description
      </h3>
      
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800">
        {description ? (
          <div className="whitespace-pre-line">{description}</div>
        ) : (
          <div className="text-gray-400 italic">No description provided</div>
        )}
      </div>
    </div>
  );
};