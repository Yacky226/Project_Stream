import { AlertCircle, Loader2, Save } from 'lucide-react';
import type { SettingsPageDataModel } from '../useSettingsPageData';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Button } from '../../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { SettingsAccountTab } from './SettingsAccountTab';
import { SettingsGeneralTab } from './SettingsGeneralTab';
import { SettingsNotificationsTab } from './SettingsNotificationsTab';
import { SettingsPrivacyTab } from './SettingsPrivacyTab';

interface SettingsPageContentProps {
  model: SettingsPageDataModel;
}

export function SettingsPageContent({ model }: SettingsPageContentProps) {
  if (model.authLoading || model.preferencesLoading || !model.localPreferences) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-[28px] border border-dashed border-border bg-card">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl">{model.settingsTitle}</h1>
          <p className="text-muted-foreground">Configuration synchronisee avec les endpoints backend.</p>
        </div>
        <Button onClick={() => void model.handleSave()} disabled={model.isSaving || !model.canSave}>
          {model.isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Sauvegarder
            </>
          )}
        </Button>
      </div>

      {model.preferencesError && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Le chargement des parametres a echoue.</AlertDescription>
        </Alert>
      )}

      {model.submitError && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{model.submitError}</AlertDescription>
        </Alert>
      )}

      {model.submitSuccess && (
        <Alert className="mb-4">
          <AlertDescription>{model.submitSuccess}</AlertDescription>
        </Alert>
      )}

      <Tabs value={model.selectedTab} onValueChange={(value) => model.setSelectedTab(value as typeof model.selectedTab)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Confidentialite</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <SettingsGeneralTab
            localPreferences={model.localPreferences}
            handlePartialUpdate={model.handlePartialUpdate}
          />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <SettingsNotificationsTab
            localPreferences={model.localPreferences}
            handlePartialUpdate={model.handlePartialUpdate}
          />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <SettingsPrivacyTab
            localPreferences={model.localPreferences}
            handlePartialUpdate={model.handlePartialUpdate}
          />
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <SettingsAccountTab
            userEmail={model.userEmail}
            localPreferences={model.localPreferences}
            handleExportData={model.handleExportData}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
