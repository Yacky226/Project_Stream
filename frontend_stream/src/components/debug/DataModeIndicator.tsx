/**
 * Indicateur du mode de données pour le développement
 * Affiche si l'application utilise des données mock ou réelles
 */

import { useState } from 'react';
import { configUtils } from '../../lib/config';
import { useDevData } from '../../hooks/useData';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

export function DataModeIndicator() {
  const [isOpen, setIsOpen] = useState(false);
  const { getCurrentMode, toggleDataMode, logCurrentState } = useDevData();
  
  // Ne pas afficher en production
  if (!configUtils.isDevelopment()) {
    return null;
  }

  const mode = getCurrentMode();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm border-2 hover:bg-background/90"
          >
            <div className="flex items-center gap-2">
              <div 
                className={`w-2 h-2 rounded-full ${
                  mode.useMockData ? 'bg-yellow-500' : 'bg-green-500'
                }`} 
              />
              <span className="text-xs font-medium">
                {mode.useMockData ? 'Mock' : 'Live'}
              </span>
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Card className="mt-2 p-4 bg-background/90 backdrop-blur-sm border-2 min-w-[280px]">
            <div className="space-y-4">
              {/* Status Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Mode de données</h3>
                <Badge 
                  variant={mode.useMockData ? "secondary" : "default"}
                  className="text-xs"
                >
                  {mode.environment.toUpperCase()}
                </Badge>
              </div>

              {/* Current Status */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source des données:</span>
                  <span className={`font-medium ${
                    mode.useMockData ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {mode.useMockData ? 'Mock Data' : 'Backend API'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Backend:</span>
                  <span className={`font-medium ${
                    mode.backendEnabled ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mode.backendEnabled ? 'Activé' : 'Désactivé'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environnement:</span>
                  <span className="font-medium">{mode.environment}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleDataMode}
                  className="flex-1 text-xs"
                >
                  Basculer mode
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logCurrentState}
                  className="text-xs"
                >
                  📋 Log
                </Button>
              </div>

              {/* Info Messages */}
              <div className="text-xs text-muted-foreground space-y-1">
                {mode.useMockData && (
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-1">
                      <span>⚠️</span>
                      <span>Utilise des données simulées</span>
                    </div>
                  </div>
                )}
                
                {!mode.backendEnabled && (
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center gap-1">
                      <span>🔌</span>
                      <span>Backend non connecté</span>
                    </div>
                  </div>
                )}
                
                {mode.backendEnabled && !mode.useMockData && (
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-1">
                      <span>✅</span>
                      <span>Connecté au backend</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <div>💡 <strong>Astuce:</strong> Utilisez les mock data pendant le développement, puis basculez vers le backend réel.</div>
              </div>
            </div>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}