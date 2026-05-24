import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
  error?: string;
}

const fieldBase =
  'w-full rounded-soft border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink placeholder:text-muted/80 transition focus:border-primary-300 focus:outline-none focus:shadow-focus';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label className="block" htmlFor={inputId}>
        {label && (
          <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-wide text-muted">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          {...rest}
          className={cn(
            fieldBase,
            error && 'border-red-300 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(220,80,80,0.15)]',
            className,
          )}
        />
        {error ? (
          <span className="mt-1 block text-xs text-red-600">{error}</span>
        ) : hint ? (
          <span className="mt-1 block text-xs text-muted">{hint}</span>
        ) : null}
      </label>
    );
  },
);
Input.displayName = 'Input';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: ReactNode;
}

export function Textarea({
  label,
  hint,
  className,
  id,
  ...rest
}: TextareaProps) {
  const fieldId = id ?? rest.name;
  return (
    <label className="block" htmlFor={fieldId}>
      {label && (
        <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
      )}
      <textarea
        id={fieldId}
        {...rest}
        className={cn(fieldBase, 'leading-relaxed', className)}
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  label,
  options,
  className,
  id,
  ...rest
}: SelectProps) {
  const fieldId = id ?? rest.name;
  return (
    <label className="block" htmlFor={fieldId}>
      {label && (
        <span className="mb-1.5 block text-[12px] font-medium uppercase tracking-wide text-muted">
          {label}
        </span>
      )}
      <select
        id={fieldId}
        {...rest}
        className={cn(fieldBase, className)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
