import type { PropsWithChildren } from "react";

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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className={`bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative ${className}`}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          onClick={onClose}
          aria-label="閉じる"
          type="button"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
