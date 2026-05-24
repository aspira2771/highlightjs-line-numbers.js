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
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl border border-line bg-surface p-6 shadow-card animate-fadeUp sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="닫기"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted transition hover:bg-panel"
        >
          <X size={18} />
        </button>
        {title && (
          <h2 className="mb-5 pr-8 font-serif text-[20px] leading-tight tracking-tightest text-ink">
            {title}
          </h2>
        )}
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex gap-2">{footer}</div>}
      </div>
    </div>
  );
}
