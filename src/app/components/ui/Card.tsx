import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { clsx } from 'clsx';

// Tipos de Card
type CardVariant = 'default' | 'outlined' | 'elevated' | 'glass';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
  hover?: boolean;
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: CardPadding;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant = 'default', 
    padding = 'md',
    hover = false,
    children, 
    ...props 
  }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-200 ease-out';
    
    const variantClasses = {
      default: 'bg-white border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800',
      outlined: 'bg-white border-2 border-gray-200 dark:bg-gray-900 dark:border-gray-700',
      elevated: 'bg-white shadow-md border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-2xl',
      glass: 'glass-morphism border border-white/20 dark:border-gray-700/30'
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : '';

    return (
      <div
        className={clsx(
          baseClasses,
          variantClasses[variant],
          paddingClasses[padding],
          hoverClasses,
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={clsx('flex flex-col space-y-1.5 pb-4', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, padding = 'none', children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6', 
      lg: 'p-8',
    };

    return (
      <div
        className={clsx('flex-1', paddingClasses[padding], className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        className={clsx('flex items-center pt-4', className)}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardBody.displayName = 'CardBody';
CardFooter.displayName = 'CardFooter';

export { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  type CardProps 
};
