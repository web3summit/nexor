import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  label?: string;
  error?: string;
  glassmorphism?: boolean;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      glassmorphism = true,
      fullWidth = false,
      className = '',
      disabled,
      onChange,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'block rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 appearance-none';
    
    // Glassmorphism styles
    const glassStyles = glassmorphism
      ? 'backdrop-blur-md bg-white/10 border border-white/20 dark:bg-black/10'
      : 'bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-700';
    
    // Error styles
    const errorStyles = error
      ? 'border-red-500 focus:ring-red-500'
      : 'focus:ring-primary/50';
    
    // Disabled styles
    const disabledStyles = disabled
      ? 'opacity-60 cursor-not-allowed'
      : '';
    
    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';
    
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };
    
    return (
      <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              ${baseStyles}
              ${glassStyles}
              ${errorStyles}
              ${disabledStyles}
              ${widthStyles}
              ${className}
            `}
            disabled={disabled}
            onChange={handleChange}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
