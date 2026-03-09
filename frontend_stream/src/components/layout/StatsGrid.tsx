import { ReactNode } from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend,
  className 
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl sm:text-3xl font-semibold">
                {value}
              </p>
              {trend && (
                <span className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-600" : "text-red-600"
                )}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
          </div>
          
          {Icon && (
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ml-4">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatsGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ 
  children, 
  columns = 4,
  className 
}: StatsGridProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn(
      "grid gap-4 lg:gap-6",
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
}
