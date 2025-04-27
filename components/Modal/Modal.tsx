import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ModalDialogProps {
  title: string;
  description: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  modalBodyComponents: React.ReactNode;
  variant?: 'default' | 'destructive' | 'success';
  triger?: React.ReactNode
}

export const ModalDialog: React.FC<ModalDialogProps> = ({
  title,
  description,
  open,
  setOpen,
  modalBodyComponents,
  variant = 'default',
  triger
}) => {
  // Define color variants with Tailwind classes
  const variants = {
    default: {
      title: "text-gray-900",
      description: "text-gray-500",
      overlay: "bg-black/50",
      content: "bg-white border border-gray-200",
      closeButton: "hover:bg-gray-100 focus:ring-gray-400"
    },
    destructive: {
      title: "text-red-700",
      description: "text-red-500",
      overlay: "bg-red-950/30",
      content: "bg-white border border-red-100",
      closeButton: "hover:bg-red-50 focus:ring-red-400"
    },
    success: {
      title: "text-green-700",
      description: "text-green-600",
      overlay: "bg-green-950/30",
      content: "bg-white border border-green-100",
      closeButton: "hover:bg-green-50 focus:ring-green-400"
    }
  };

  const colors = variants[variant];

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        {triger}
      </Dialog.Trigger>
      <Dialog.Portal>
        {/* Overlay with improved animation */}
        <Dialog.Overlay 
          className={`
            fixed inset-0 ${colors.overlay}
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            duration-300 ease-in-out
            z-10
          `} 
        />
        
        {/* Content with enhanced natural animation */}
        <Dialog.Content 
          className={`
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            max-h-[85vh] w-[90vw] max-w-[500px]
            rounded-lg ${colors.content} p-6 shadow-lg
            focus:outline-none z-20
            
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-95
            
            data-[state=open]:slide-in-from-bottom-4
            data-[state=closed]:slide-out-to-bottom-4
            
            duration-200 ease-out
            
            transition-all
          `}
        >
          {/* Title */}
          <Dialog.Title 
            className={`text-lg font-semibold ${colors.title}`}
          >
            {title}
          </Dialog.Title>
          
          {/* Description */}
          <Dialog.Description 
            className={`mt-2 text-sm ${colors.description}`}
          >
            {description}
          </Dialog.Description>
          
          {/* Content Body */}
          <div className="mt-6">
            {modalBodyComponents}
          </div>
          
          {/* Close Button */}
          <Dialog.Close asChild>
            <button
              className={`
                absolute right-4 top-4 
                rounded-full p-1 
                opacity-70 hover:opacity-100
                transition-opacity duration-200
                focus:outline-none focus:ring-2 ${colors.closeButton} focus:ring-offset-2
              `}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};