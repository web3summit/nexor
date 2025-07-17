import React from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  glassmorphism?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  glassmorphism = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base styles
  const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant styles
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-900',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
  };
  
  // Glassmorphism styles
  const glassStyles = glassmorphism ? 
    'backdrop-blur-md bg-white/10 border border-white/20 shadow-lg dark:bg-black/10' : '';
  
  // Loading and disabled styles
  const loadingStyles = isLoading ? 'opacity-70 cursor-not-allowed' : '';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${glassStyles}
        ${loadingStyles}
        ${disabledStyles}
        ${widthStyles}
        ${className}
      `}
      disabled={disabled || isLoading}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};
