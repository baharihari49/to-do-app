import { ListTodo, Search, Loader2 } from 'lucide-react';
import React from 'react';

interface EmptyRowProps {
  searchActive?: boolean;
  isSearching?: boolean;
}

export const EmptyRow: React.FC<EmptyRowProps> = ({ 
  searchActive = false,
  isSearching = false
}) => (
  <tr>
    <td colSpan={8} className="h-24 text-center">
      <div className="flex flex-col items-center justify-center text-muted-foreground">
        {searchActive ? (
          isSearching ? (
            <>
              <Loader2 className="h-8 w-8 mb-2 text-muted-foreground animate-spin" />
              <p>Searching...</p>
            </>
          ) : (
            <>
              <Search className="h-8 w-8 mb-2 text-muted-foreground" />
              <p>No tasks found matching your search</p>
            </>
          )
        ) : (
          <>
            <ListTodo className="h-8 w-8 mb-2" />
            <p>No tasks found</p>
          </>
        )}
      </div>
    </td>
  </tr>
);