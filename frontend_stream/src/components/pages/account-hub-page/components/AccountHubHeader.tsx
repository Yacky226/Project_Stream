import { HelpCircle, Mail, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar';
import { Button } from '../../../ui/button';
import { getInitials } from '../accountHub.utils';
import type { AccountHubDataModel } from '../useAccountHubData';

interface AccountHubHeaderProps {
  model: AccountHubDataModel;
  onNavigate: (path: string | number) => void;
}

export function AccountHubHeader({ model, onNavigate }: AccountHubHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-[#101622]/85 md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-[#1152d4] p-2 text-white">
            <Settings className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold tracking-tight">User Profile & Settings</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="relative rounded-xl"
            onClick={() => onNavigate('/notifications')}
          >
            <Mail className="h-4 w-4" />
            {model.unreadCount > 0 ? (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            ) : null}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => onNavigate('/help')}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8 border border-[#1152d4]/20">
            <AvatarImage src={model.profileForm.avatar || undefined} />
            <AvatarFallback className="bg-[#1152d4]/10 text-[#1152d4]">
              {getInitials(model.profileForm.firstName, model.profileForm.lastName)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
