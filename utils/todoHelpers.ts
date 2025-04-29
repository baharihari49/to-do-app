// utils/todoHelpers.ts

import { PriorityLevel } from "@/Types/Types";

// Format a date string into a readable format
export function formatDate(dateString: string ): string {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date'; // Optional: handle invalid dates safely
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}


// Determine if a date is overdue compared to today
export function isOverdue(dateString: string | null): boolean {
  if (!dateString) return false;
  const dueDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today;
}

// Get TailwindCSS classes for priority badge
export function getPriorityColor(priority: PriorityLevel): string {
  switch (priority) {
    case 'high':
      return 'bg-destructive/10 text-destructive hover:bg-destructive/20';
    case 'medium':
      return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20';
    case 'low':
      return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20';
    default:
      return '';
  }
}
