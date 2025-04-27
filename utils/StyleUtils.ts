// StyleUtils.ts

// Get priority badge color
export const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500 text-white hover:bg-red-600";
      case "medium": return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "low": return "bg-blue-500 text-white hover:bg-blue-600";
      default: return "bg-gray-500 text-white hover:bg-gray-600";
    }
  };