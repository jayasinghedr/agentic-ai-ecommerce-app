import { InputHTMLAttributes, forwardRef } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-brand-dark mb-1">{label}</label>
        )}
        <input
          ref={ref}
          className={`input-field ${error ? 'border-brand-red focus:ring-brand-red' : ''} ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
