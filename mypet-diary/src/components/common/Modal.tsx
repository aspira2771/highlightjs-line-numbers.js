import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-card sm:rounded-soft"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-muted hover:bg-primary-50"
        >
          <X size={20} />
        </button>
        {title && (
          <h2 className="mb-4 pr-8 text-lg font-bold text-ink">{title}</h2>
        )}
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex gap-2">{footer}</div>}
      </div>
    </div>
  );
}
