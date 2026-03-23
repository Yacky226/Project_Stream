import { Check } from 'lucide-react';
import { stepLabel, type BuilderStep } from './courseBuilder.utils';

interface CourseBuilderHeaderProps {
  progress: number;
  step: BuilderStep;
}

export function CourseBuilderHeader({ progress, step }: CourseBuilderHeaderProps) {
  return (
    <div className="mb-10 w-full max-w-5xl">
      <div className="mb-7 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-black tracking-tight text-slate-900">Create New Course</h2>
          <p className="text-sm font-medium text-slate-500">
            Step {step} of 4: {stepLabel(step)}
          </p>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
            <span className="text-xs font-bold text-blue-600">{progress}% Complete</span>
            <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-600" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex items-start justify-between">
        <div className="absolute left-0 top-1/2 -z-10 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
        {([1, 2, 3, 4] as BuilderStep[]).map((itemStep) => (
          <div key={itemStep} className="flex min-w-[78px] flex-col items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                step === itemStep
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : step > itemStep
                    ? 'border border-blue-200 bg-blue-50 text-blue-600'
                    : 'border border-slate-200 bg-white text-slate-400'
              }`}
            >
              {step > itemStep ? <Check className="h-4 w-4" /> : itemStep}
            </div>
            <span
              className={`text-[11px] ${
                step === itemStep
                  ? 'font-bold text-slate-900'
                  : 'font-semibold text-slate-400'
              }`}
            >
              {stepLabel(itemStep)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface CourseBuilderBannerProps {
  message: string;
  tone: 'error' | 'success';
}

export function CourseBuilderBanner({ message, tone }: CourseBuilderBannerProps) {
  const className =
    tone === 'error'
      ? 'mb-6 w-full max-w-4xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'
      : 'mb-6 w-full max-w-4xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700';

  return <div className={className}>{message}</div>;
}
