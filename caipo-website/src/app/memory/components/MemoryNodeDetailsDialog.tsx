import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MemoryNodeDetailsDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    description?: string | null;
}
export const MemoryNodeDetailsDialog = ({open, setOpen, description}: MemoryNodeDetailsDialogProps) => { 
    return (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black text-white">
            <DialogHeader>
            <DialogTitle >Memory node</DialogTitle>
            <DialogDescription>
                {description}
            </DialogDescription>
            </DialogHeader>
        </DialogContent>
        </Dialog>
    )
}