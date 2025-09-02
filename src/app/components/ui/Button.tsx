import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'gray';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'solid',
  size = 'md',
  color = 'primary',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    solid: {
      primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
      secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary',
      gray: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    },
    outlined: {
      primary: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
      secondary: 'border-2 border-secondary text-secondary hover:bg-secondary hover:text-white focus:ring-secondary',
      gray: 'border-2 border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white focus:ring-gray-500',
    },
    text: {
      primary: 'text-primary hover:bg-primary/10 focus:ring-primary',
      secondary: 'text-secondary hover:bg-secondary/10 focus:ring-secondary',
      gray: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
    },
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant][color],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
