import { Search } from 'lucide-react';
import type { NotificationsPageDataModel } from '../notificationsPage.types';
import { NotificationsPageBody } from './NotificationsPageBody';

interface NotificationsPageFallbackProps {
  model: NotificationsPageDataModel;
}

export function NotificationsPageFallback({ model }: NotificationsPageFallbackProps) {
  return (
    <div
      className={`min-h-screen px-4 py-8 sm:px-6 lg:px-8 ${
        model.isDark ? 'bg-[#09111f] text-[#e2e8f0]' : 'bg-[#eef4ff] text-[#0f172a]'
      }`}
      style={{ fontFamily: 'Lexend, system-ui, sans-serif' }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
            <p className={`mt-2 text-sm ${model.mutedTextClass}`}>
              Votre centre de notifications est synchronise avec les endpoints backend.
            </p>
          </div>
          <div className="relative w-full max-w-md">
            <Search className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${model.mutedTextClass}`} />
            <input
              value={model.searchQuery}
              onChange={(event) => model.setSearchQuery(event.target.value)}
              className={`h-12 w-full rounded-2xl border pl-11 pr-4 text-sm shadow-sm transition focus:border-[#1152d4] focus:outline-none focus:ring-4 focus:ring-[#1152d4]/15 ${
                model.isDark
                  ? 'border-[#334155] bg-[#162033] text-[#e2e8f0] placeholder:text-[#7f8ea3]'
                  : 'border-[#dbe6ff] bg-white text-[#0f172a] placeholder:text-[#94a3b8]'
              }`}
              placeholder="Search notifications..."
              type="text"
            />
          </div>
        </div>
        <NotificationsPageBody model={model} />
      </div>
    </div>
  );
}
