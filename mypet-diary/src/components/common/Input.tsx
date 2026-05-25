import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: ReactNode;
  error?: string;
}

const fieldBase =
  'w-full rounded-soft bg-gray-100 px-4 py-3.5 text-[15px] font-medium text-ink placeholder:text-gray-400 placeholder:font-normal transition focus:bg-surface focus:outline-none focus:shadow-focus';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className, id, ...rest }, ref) => {
    const inputId = id ?? rest.name;
    return (
      <label className="block" htmlFor={inputId}>
        {label && (
          <span className="mb-2 block text-[13px] font-semibold text-gray-700">
            {label}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          {...rest}
          className={cn(
            fieldBase,
            error && 'shadow-[0_0_0_2px_#F04452] focus:shadow-[0_0_0_2px_#F04452]',
            className,
          )}
        />
        {error ? (
          <span className="mt-1.5 block text-[13px] font-medium text-negative">
            {error}
          </span>
        ) : hint ? (
          <span className="mt-1.5 block text-[13px] text-muted">{hint}</span>
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
        <span className="mb-2 block text-[13px] font-semibold text-gray-700">
          {label}
        </span>
      )}
      <textarea
        id={fieldId}
        {...rest}
        className={cn(fieldBase, 'leading-relaxed', className)}
      />
      {hint && <span className="mt-1.5 block text-[13px] text-muted">{hint}</span>}
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
        <span className="mb-2 block text-[13px] font-semibold text-gray-700">
          {label}
        </span>
      )}
      <select
        id={fieldId}
        {...rest}
        className={cn(fieldBase, 'appearance-none', className)}
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
