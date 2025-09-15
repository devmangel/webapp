import React from 'react';
import { clsx } from 'clsx';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'small';
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
  href?: string;
  type?: string; // Para compatibilidad con código existente
  [key: string]: unknown; // Para props adicionales
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body1',
  as,
  className,
  children,
  href,
  type,
  ...props
}) => {
  // Si se usa 'type' en lugar de 'variant', mapear los valores
  const actualVariant = type === 'h6' ? 'h6' : variant;
  
  const variantClasses = {
    h1: 'text-4xl font-bold tracking-tight',
    h2: 'text-3xl font-bold tracking-tight',
    h3: 'text-2xl font-semibold tracking-tight',
    h4: 'text-xl font-semibold tracking-tight',
    h5: 'text-lg font-semibold',
    h6: 'text-base font-semibold',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs text-gray-600',
    small: 'text-sm text-gray-500',
  };

  const defaultElements: Record<string, React.ElementType> = {
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    h5: 'h5',
    h6: 'h6',
    body1: 'p',
    body2: 'p',
    caption: 'span',
    small: 'small',
  };

  const Element = as || (href ? 'a' : defaultElements[actualVariant]);

  return (
    <Element
      className={clsx(variantClasses[actualVariant], className)}
      href={href}
      {...props}
    >
      {children}
    </Element>
  );
};
