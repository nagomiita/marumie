import type { PropsWithChildren } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ModalProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  className?: string;
}

export default function Modal({
  open,
  onClose,
  className = "",
  children,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className={className}>{children}</DialogContent>
    </Dialog>
  );
}
