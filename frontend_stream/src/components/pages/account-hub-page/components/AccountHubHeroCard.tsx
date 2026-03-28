import { Camera, Download, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar';
import { Button } from '../../../ui/button';
import { getInitials, toDisplayDate } from '../accountHub.utils';
import type { AccountHubDataModel } from '../useAccountHubData';

interface AccountHubHeroCardProps {
  model: AccountHubDataModel;
  onNavigate: (path: string | number) => void;
}

export function AccountHubHeroCard({ model, onNavigate }: AccountHubHeroCardProps) {
  if (!model.profile) {
    return null;
  }

  const profileAction = model.getProfileAction();

  return (
    <div className="mb-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-6 md:flex-row">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-white shadow-lg dark:border-slate-800">
            <AvatarImage src={model.profileForm.avatar || undefined} />
            <AvatarFallback className="bg-[#1152d4]/10 text-3xl font-bold text-[#1152d4]">
              {getInitials(model.profileForm.firstName, model.profileForm.lastName)}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => model.fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#1152d4] p-2 text-white shadow-lg dark:border-slate-900"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={model.fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => void model.handleAvatarUpload(event)}
          />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold">
            {model.profileForm.firstName} {model.profileForm.lastName}
          </h1>
          <p className="font-medium text-slate-500 dark:text-slate-400">
            {model.getRoleLabel()} - {model.roleMeta}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 md:justify-start">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {model.extras.location || 'Location to complete'}
            </span>
            <span>{toDisplayDate(model.profile.createdAt)}</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto">
          <Button
            className="rounded-xl bg-[#1152d4] text-white hover:bg-[#0f47b9]"
            onClick={() => onNavigate(profileAction.path)}
          >
            {profileAction.label}
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={model.handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
}
