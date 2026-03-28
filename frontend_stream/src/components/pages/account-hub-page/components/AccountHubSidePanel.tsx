import { Button } from '../../../ui/button';
import { Card, CardContent } from '../../../ui/card';
import { Switch } from '../../../ui/switch';
import type { AccountHubDataModel } from '../useAccountHubData';

interface AccountHubSidePanelProps {
  model: AccountHubDataModel;
  onNavigate: (path: string | number) => void;
}

export function AccountHubSidePanel({ model, onNavigate }: AccountHubSidePanelProps) {
  if (!model.preferencesForm) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[24px] border-[#1152d4]/20 bg-[#1152d4]/5">
        <CardContent className="p-6">
          <h4 className="mb-4 font-bold text-[#1152d4]">Profile Strength</h4>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/80 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-[#1152d4]"
              style={{ width: `${model.profileStrength}%` }}
            />
          </div>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Votre profil est complete a {model.profileStrength}%. Ajoutez une localisation et au
            moins un lien externe pour le renforcer.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-[24px] border-slate-200 dark:border-slate-800">
        <CardContent className="space-y-4 p-6">
          <h4 className="font-bold">Privacy</h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Public Profile</p>
              <p className="text-xs text-slate-500">Allow users to find you</p>
            </div>
            <Switch
              checked={model.preferencesForm.allowProfileViews}
              onCheckedChange={(checked) => model.updatePreferenceField('allowProfileViews', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Show Activity</p>
              <p className="text-xs text-slate-500">Share what you're up to</p>
            </div>
            <Switch
              checked={model.preferencesForm.showOnlineStatus}
              onCheckedChange={(checked) => model.updatePreferenceField('showOnlineStatus', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-[24px] border-slate-900 bg-slate-900 text-white">
        <CardContent className="relative p-6">
          <div className="relative z-10">
            <h4 className="font-bold">Need Help?</h4>
            <p className="mt-2 text-xs text-slate-400">
              Notre equipe support peut vous aider sur le profil, les preferences et la configuration
              de votre compte.
            </p>
            <Button
              className="mt-4 w-full rounded-xl bg-white text-slate-900 hover:bg-slate-100"
              onClick={() => onNavigate('/help')}
            >
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
