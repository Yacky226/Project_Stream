import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Button } from '../../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import type { ResetPasswordPageData, ResetPasswordPageProps } from '../resetPassword.types';

interface ResetPasswordPageContentProps {
  data: ResetPasswordPageData;
  onNavigate: ResetPasswordPageProps['onNavigate'];
}

export function ResetPasswordPageContent({
  data,
  onNavigate,
}: ResetPasswordPageContentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl">Nouveau mot de passe</CardTitle>
          <CardDescription className="text-center">
            Definissez un nouveau mot de passe pour votre compte
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!data.hasToken ? (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Lien de reinitialisation invalide. Veuillez demander un nouveau lien.
              </AlertDescription>
            </Alert>
          ) : null}

          {data.tokenError ? (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{data.tokenError}</AlertDescription>
            </Alert>
          ) : null}

          {data.authError ? (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{data.authError}</AlertDescription>
            </Alert>
          ) : null}

          {data.successMessage ? (
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{data.successMessage}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={data.handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={data.showPassword ? 'text' : 'password'}
                  value={data.formData.newPassword}
                  onChange={(event) => data.handleInputChange('newPassword', event.target.value)}
                  disabled={data.isLoading || !data.hasToken}
                  className={data.validationErrors.newPassword ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => data.setShowPassword(!data.showPassword)}
                  disabled={data.isLoading || !data.hasToken}
                >
                  {data.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {data.validationErrors.newPassword ? (
                <p className="text-sm text-destructive">{data.validationErrors.newPassword}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={data.showConfirmPassword ? 'text' : 'password'}
                  value={data.formData.confirmPassword}
                  onChange={(event) =>
                    data.handleInputChange('confirmPassword', event.target.value)
                  }
                  disabled={data.isLoading || !data.hasToken}
                  className={data.validationErrors.confirmPassword ? 'border-destructive' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => data.setShowConfirmPassword(!data.showConfirmPassword)}
                  disabled={data.isLoading || !data.hasToken}
                >
                  {data.showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {data.validationErrors.confirmPassword ? (
                <p className="text-sm text-destructive">{data.validationErrors.confirmPassword}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={data.isLoading || !data.hasToken}>
              {data.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Mettre a jour le mot de passe
            </Button>
          </form>

          <div className="mt-4 text-center">
            {data.hasToken ? (
              <button
                onClick={() => onNavigate('/auth/signin')}
                className="text-sm text-primary hover:underline"
              >
                Retour a la connexion
              </button>
            ) : (
              <button
                onClick={() => onNavigate('/auth/forgot')}
                className="text-sm text-primary hover:underline"
              >
                Demander un nouveau lien
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
