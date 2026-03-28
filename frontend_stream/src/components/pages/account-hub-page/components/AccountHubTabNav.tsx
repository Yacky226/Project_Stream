import { ACCOUNT_TABS } from '../accountHub.utils';
import type { AccountHubDataModel } from '../useAccountHubData';

interface AccountHubTabNavProps {
  model: AccountHubDataModel;
}

export function AccountHubTabNav({ model }: AccountHubTabNavProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <nav className="flex min-w-max border-b border-slate-200 dark:border-slate-800">
        {ACCOUNT_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => model.setActiveTab(tab.key)}
            className={`px-6 py-4 text-sm font-semibold transition-colors ${
              model.activeTab === tab.key
                ? 'border-b-2 border-[#1152d4] text-[#1152d4]'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
