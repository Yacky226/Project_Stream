import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Header de section avec titre et action optionnelle
 */
export function SectionHeader({
  title,
  description,
  action,
  className
}: SectionHeaderProps) {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6",
      className
    )}>
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-semibold">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}
