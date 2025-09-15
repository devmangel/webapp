import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  variant?: 'filled' | 'outlined' | 'shadow';
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  variant = 'shadow',
  ...props
}) => {
  const baseClasses = 'rounded-lg overflow-hidden';
  
  const variantClasses = {
    filled: 'bg-white dark:bg-gray-800',
    outlined: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
    shadow: 'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow',
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardBodyProps {
  className?: string;
  children: React.ReactNode;
}

export const CardBody: React.FC<CardBodyProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={clsx('p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};
