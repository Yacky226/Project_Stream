import type { ComponentType } from 'react';

interface InfoCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

export function InfoCard({ icon: Icon, label, value }: InfoCardProps) {
  return (
    <div className="rounded-lg border p-3">
      <p className="mb-1 text-xs text-muted-foreground">
        <Icon className="mr-1 inline h-4 w-4" />
        {label}
      </p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
