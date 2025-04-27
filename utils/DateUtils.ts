// DateUtils.ts
import { isToday, differenceInDays } from 'date-fns';

// Format date
export const formatDate = (dateString: string, includeTime = false) => {
  if (!dateString) return 'No date specified';
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return new Date(dateString).toLocaleDateString('en-US', options);
};

// Calculate days remaining or overdue
export const getDaysStatus = (dateString: string, status: string) => {
  if (!dateString) return { text: 'No due date', type: 'info', icon: 'clock4' };
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateString);
  dueDate.setHours(0, 0, 0, 0);
  
  if (status === 'completed') {
    return { 
      text: 'Completed', 
      type: 'success',
      icon: 'checkSquare'
    };
  }
  
  if (isToday(dueDate)) {
    return { 
      text: 'Due today', 
      type: 'warning',
      icon: 'alertCircle'
    };
  }
  
  const diffDays = differenceInDays(dueDate, today);
  
  if (diffDays < 0) {
    return { 
      text: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`, 
      type: 'error',
      icon: 'alertCircle'
    };
  } else {
    return { 
      text: `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`, 
      type: 'info',
      icon: 'clock'
    };
  }
};