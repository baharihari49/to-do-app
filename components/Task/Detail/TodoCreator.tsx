// TodoCreator.tsx
import Image from 'next/image';

interface TodoCreatorProps {
  createdBy: {
    name: string;
    avatar?: string;
  };
}

export const TodoCreator: React.FC<TodoCreatorProps> = ({ createdBy }) => {
  // Generate initials for avatar fallback
  const getInitials = () => {
    return createdBy.name?.split(' ').map((n: string) => n[0]).join('') || '??';
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Created By</h3>
      
      <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
        <div className="relative h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden mr-4 border-2 border-white shadow">
          {createdBy.avatar ? (
            <Image 
              src={createdBy.avatar}
              alt={`${createdBy.name}'s avatar`}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-primary-700">
              {getInitials()}
            </span>
          )}
        </div>
        
        <div>
          <p className="font-semibold">{createdBy.name}</p>
          <p className="text-sm text-gray-500">Task Owner</p>
        </div>
      </div>
    </div>
  );
};