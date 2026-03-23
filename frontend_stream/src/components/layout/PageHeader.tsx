import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
}

/**
 * Header de page responsive avec titre, description et actions
 */
export function PageHeader({
  title,
  description,
  actions,
  onBack,
  backLabel = 'Retour',
  className
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6 lg:mb-8", className)}>
      {/* Back button si present */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {backLabel}
        </Button>
      )}

      {/* Titre et actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        
        {actions && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
