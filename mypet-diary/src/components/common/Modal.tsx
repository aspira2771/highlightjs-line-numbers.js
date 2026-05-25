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
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-t-3xl bg-surface px-6 pb-7 pt-6 shadow-float animate-fadeUp sm:rounded-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-pill bg-gray-200 sm:hidden" />
        <div className="mb-5 flex items-center justify-between">
          {title ? (
            <h2 className="text-[20px] font-bold tracking-tight text-ink">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            aria-label="닫기"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex gap-2">{footer}</div>}
      </div>
    </div>
  );
}
