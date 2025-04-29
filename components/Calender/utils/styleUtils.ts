
export const getStatusStyle = (status: string) => {
  switch(status) {
    case 'completed':
      return 'bg-muted line-through';
    case 'in-progress':
      return 'bg-blue-100/50 border-l-2 border-blue-500';
    default:
      return 'bg-primary/10';
  }
};

export const getInitials = (name: string) => {
  if (!name) return "?";
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};