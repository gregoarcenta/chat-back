import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/ui/dialog.tsx';
import { Button } from '@/ui/button.tsx';

interface errorDialogProps {
  error: Error | null;
  onClose: () => void;
}

export default function ErrorDialog({ error, onClose }: errorDialogProps) {
  return (
    <Dialog open={!!error} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Error</DialogTitle>
          <DialogDescription>{error?.message}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
