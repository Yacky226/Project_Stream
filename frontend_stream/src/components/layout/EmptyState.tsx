import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

/**
 * Composant Empty State responsive et moderne
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 text-center px-4",
      className
    )}>
      <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-full bg-muted/50 flex items-center justify-center mb-4 sm:mb-6">
        <Icon className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
        {title}
      </h3>
      
      <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      
      {action && (
        <Button 
          size="lg"
          onClick={action.onClick}
          className="w-full sm:w-auto"
        >
          {action.label}
        </Button>
      )}
      
      {children}
    </div>
  );
}
