import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface FormFooterProps {
  isEditing?: boolean;
  onCancel?: () => void;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  isEditing = false,
  onCancel,
}) => {
  return (
    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
      {onCancel && (
        <Button 
          variant="outline" 
          onClick={onCancel}
          type="button" // Important to prevent form submission
        >
          Cancel
        </Button>
      )}
      <Button type="submit">
        {isEditing ? 'Update Task' : 'Create Task'}
      </Button>
    </DialogFooter>
  );
};