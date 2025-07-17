import React from 'react';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  glassmorphism?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  glassmorphism = false,
  size = 'md',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-1.5 px-3',
    lg: 'text-base py-2 px-4',
  };
  
  // Container classes
  const containerClasses = `
    flex flex-wrap gap-2 
    ${glassmorphism ? 'p-1 bg-white/5 backdrop-blur-sm rounded-lg' : ''}
    ${className}
  `;
  
  // Tab classes
  const getTabClasses = (isActive: boolean) => `
    ${sizeClasses[size]}
    rounded-md
    transition-all
    duration-200
    cursor-pointer
    ${isActive 
      ? glassmorphism
        ? 'bg-white/10 text-white shadow-sm'
        : 'bg-purple-600 text-white'
      : 'text-gray-300 hover:text-white hover:bg-white/5'
    }
  `;

  return (
    <div className={containerClasses}>
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          className={getTabClasses(activeTab === tab.id)}
          onClick={() => onChange(tab.id)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center space-x-1.5">
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.label}</span>
          </div>
        </motion.button>
      ))}
    </div>
  );
};
