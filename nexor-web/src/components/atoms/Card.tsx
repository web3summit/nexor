import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  glassmorphism?: boolean;
  hoverEffect?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  bordered?: boolean;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glassmorphism = true,
  hoverEffect = false,
  padding = 'md',
  bordered = true,
  elevation = 'md',
}) => {
  // Padding styles
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-8',
  };

  // Elevation styles
  const elevationStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  // Glassmorphism styles
  const glassStyles = glassmorphism
    ? 'backdrop-blur-md bg-white/20 dark:bg-black/20'
    : 'bg-white dark:bg-gray-800';

  // Border styles
  const borderStyles = bordered
    ? 'border border-white/20 dark:border-gray-700/30'
    : '';

  return (
    <motion.div
      className={`
        rounded-2xl
        ${paddingStyles[padding]}
        ${elevationStyles[elevation]}
        ${glassStyles}
        ${borderStyles}
        ${className}
      `}
      whileHover={
        hoverEffect
          ? {
              scale: 1.02,
              transition: { duration: 0.2 },
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
};
