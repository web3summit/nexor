import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  glassmorphism?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      glassmorphism = true,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'block rounded-lg px-4 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2';
    
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
    
    // Icon styles
    const hasLeftIcon = leftIcon ? 'pl-10' : '';
    const hasRightIcon = rightIcon ? 'pr-10' : '';
    
    return (
      <div className={`relative ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              ${baseStyles}
              ${glassStyles}
              ${errorStyles}
              ${disabledStyles}
              ${widthStyles}
              ${hasLeftIcon}
              ${hasRightIcon}
              ${className}
            `}
            disabled={disabled}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
