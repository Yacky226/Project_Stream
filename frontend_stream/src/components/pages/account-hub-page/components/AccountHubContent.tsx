import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import type { AccountHubDataModel } from '../useAccountHubData';
import { AccountHubHeader } from './AccountHubHeader';
import { AccountHubHeroCard } from './AccountHubHeroCard';
import { AccountHubSidePanel } from './AccountHubSidePanel';
import { AccountHubTabNav } from './AccountHubTabNav';
import { AccountHubTabPanels } from './AccountHubTabPanels';

interface AccountHubContentProps {
  model: AccountHubDataModel;
  onNavigate: (path: string | number) => void;
}

export function AccountHubContent({ model, onNavigate }: AccountHubContentProps) {
  return (
    <div
      className="min-h-screen bg-[#f6f6f8] text-slate-900 dark:bg-[#101622] dark:text-slate-100"
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <AccountHubHeader model={model} onNavigate={onNavigate} />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        {model.profileError || model.preferencesError || model.submitError || model.submitSuccess ? (
          <div className="mb-6 space-y-3">
            {model.profileError || model.preferencesError || model.submitError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {model.submitError ||
                    'Un probleme est survenu pendant le chargement du compte.'}
                </AlertDescription>
              </Alert>
            ) : null}
            {model.submitSuccess ? (
              <Alert>
                <AlertDescription>{model.submitSuccess}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        ) : null}

        <AccountHubHeroCard model={model} onNavigate={onNavigate} />
        <AccountHubTabNav model={model} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <AccountHubTabPanels model={model} onNavigate={onNavigate} />
          </div>
          <AccountHubSidePanel model={model} onNavigate={onNavigate} />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 md:flex-row">
          <p>(c) 2024 EduFlow Account Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => onNavigate('/privacy')}
              className="transition-colors hover:text-[#1152d4]"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/terms')}
              className="transition-colors hover:text-[#1152d4]"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/help')}
              className="transition-colors hover:text-[#1152d4]"
            >
              Help Center
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
