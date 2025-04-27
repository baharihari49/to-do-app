// DeleteConfirmationDialog.tsx
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog";
  import { Button } from '@/components/ui/button';
  
  interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onDelete: () => void;
  }
  
  export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ 
    isOpen, 
    setIsOpen, 
    onDelete 
  }) => {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };