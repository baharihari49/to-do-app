import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getInitials } from '../utils/styleUtils';

interface OwnerAvatarProps {
  owner: {
    name: string;
    avatar?: string;
  };
}

export const OwnerAvatar = ({ owner }: OwnerAvatarProps) => {
  if (!owner) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar className="h-6 w-6">
            {owner.avatar ? (
              <AvatarImage src={owner.avatar} alt={owner.name} />
            ) : (
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(owner.name)}
              </AvatarFallback>
            )}
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>Assigned to: {owner.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};