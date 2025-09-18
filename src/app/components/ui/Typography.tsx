import { forwardRef, type HTMLAttributes, type ReactNode, type ElementType } from 'react';
import { clsx } from 'clsx';

// Tipos de tipografía
type TypographyVariant = 
  | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  | 'title' | 'subtitle' | 'body' | 'caption' | 'overline'
  | 'display-lg' | 'display-md' | 'display-sm';

type TypographyWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
type TypographyColor = 'primary' | 'secondary' | 'muted' | 'success' | 'warning' | 'error';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  variant?: TypographyVariant;
  weight?: TypographyWeight;
  color?: TypographyColor;
  children: ReactNode;
  as?: ElementType;
  truncate?: boolean;
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ 
    className, 
    variant = 'body', 
    weight = 'normal',
    color = 'primary',
    children, 
    as,
    truncate = false,
    ...props 
  }, ref) => {
    
    // Mapeo de variantes a elementos HTML por defecto
    const defaultElements: Record<TypographyVariant, ElementType> = {
      'display-lg': 'h1',
      'display-md': 'h1',
      'display-sm': 'h2',
      'h1': 'h1',
      'h2': 'h2',
      'h3': 'h3',
      'h4': 'h4',
      'h5': 'h5',
      'h6': 'h6',
      'title': 'h2',
      'subtitle': 'h3',
      'body': 'p',
      'caption': 'span',
      'overline': 'span'
    };

    // Clases de tamaño y espaciado estilo Apple
    const variantClasses: Record<TypographyVariant, string> = {
      'display-lg': 'text-5xl sm:text-6xl lg:text-7xl leading-none tracking-tight',
      'display-md': 'text-4xl sm:text-5xl lg:text-6xl leading-none tracking-tight',
      'display-sm': 'text-3xl sm:text-4xl lg:text-5xl leading-tight tracking-tight',
      'h1': 'text-3xl sm:text-4xl font-bold leading-tight tracking-tight',
      'h2': 'text-2xl sm:text-3xl font-semibold leading-tight tracking-tight',
      'h3': 'text-xl sm:text-2xl font-semibold leading-snug',
      'h4': 'text-lg sm:text-xl font-medium leading-snug',
      'h5': 'text-base sm:text-lg font-medium leading-normal',
      'h6': 'text-sm sm:text-base font-medium leading-normal',
      'title': 'text-xl font-semibold leading-snug',
      'subtitle': 'text-lg font-medium leading-relaxed',
      'body': 'text-base leading-relaxed',
      'caption': 'text-sm leading-normal',
      'overline': 'text-xs font-medium uppercase tracking-wider leading-tight'
    };

    const weightClasses: Record<TypographyWeight, string> = {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    };

    const colorClasses: Record<TypographyColor, string> = {
      primary: 'text-gray-900 dark:text-gray-100',
      secondary: 'text-gray-600 dark:text-gray-400',
      muted: 'text-gray-500 dark:text-gray-500',
      success: 'text-emerald-600 dark:text-emerald-400',
      warning: 'text-amber-600 dark:text-amber-400',
      error: 'text-red-600 dark:text-red-400'
    };

    const Element = as || defaultElements[variant];
    
    // Override font-weight específico para la variante si no se especifica weight
    const shouldUseVariantWeight = !props.style?.fontWeight && weight === 'normal';
    const finalWeightClass = shouldUseVariantWeight ? '' : weightClasses[weight];

    return (
      <Element
        className={clsx(
          variantClasses[variant],
          finalWeightClass,
          colorClasses[color],
          truncate && 'truncate',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Element>
    );
  },
);

Typography.displayName = 'Typography';

export { Typography, type TypographyProps };

// Componentes de conveniencia con tipos más específicos
export const Heading = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ level = 1, ...props }, ref) => {
    const variant = `h${level}` as TypographyVariant;
    return <Typography variant={variant} ref={ref} {...props} />;
  }
);

export const Text = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => {
    return <Typography variant="body" ref={ref} {...props} />;
  }
);

export const Caption = forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => {
    return <Typography variant="caption" ref={ref} {...props} />;
  }
);

Heading.displayName = 'Heading';
Text.displayName = 'Text';
Caption.displayName = 'Caption';
