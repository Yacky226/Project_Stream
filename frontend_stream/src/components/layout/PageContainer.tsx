import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
  noPadding?: boolean;
}

/**
 * Container responsive standard pour toutes les pages
 * Gere automatiquement le padding et max-width
 */
export function PageContainer({ 
  children, 
  className,
  maxWidth = '7xl',
  noPadding = false 
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <main className={cn(
      "container mx-auto",
      !noPadding && "px-4 sm:px-6 lg:px-8 py-6 lg:py-8",
      className
    )}>
      <div className={maxWidthClasses[maxWidth] + " mx-auto"}>
        {children}
      </div>
    </main>
  );
}
