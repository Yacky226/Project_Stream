import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminPageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
}

export function AdminPageIntro({
  eyebrow,
  title,
  description,
  actions,
  className,
}: AdminPageIntroProps) {
  return (
    <section className={cn('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1152d4]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-300">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </section>
  );
}

interface AdminKpiCardProps {
  title: string;
  value: string | number;
  meta: string;
  icon: LucideIcon;
  iconToneClass?: string;
  metaClassName?: string;
  className?: string;
}

export function AdminKpiCard({
  title,
  value,
  meta,
  icon: Icon,
  iconToneClass = 'bg-[#1152d4]/10 text-[#1152d4]',
  metaClassName,
  className,
}: AdminKpiCardProps) {
  return (
    <article
      className={cn(
        'rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={cn('rounded-2xl p-3', iconToneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
            metaClassName || 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          {meta}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">{value}</h3>
    </article>
  );
}
