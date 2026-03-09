/**
 * Development Mode Info Component
 * Affiche des informations sur le mode développement
 */

import React from 'react';
import { Info, Code2, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

export function DevelopmentModeInfo() {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-700 dark:text-blue-300">
          <Code2 className="w-5 h-5 mr-2" />
          Mode Développement Actif
          <Badge variant="secondary" className="ml-2">
            <Zap className="w-3 h-3 mr-1" />
            Demo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-blue-600 dark:text-blue-300">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-sm">
              L'application fonctionne actuellement en mode développement avec simulation des fonctionnalités de streaming.
            </p>
            <div className="space-y-1 text-xs">
              <div>✅ Interface utilisateur complète</div>
              <div>✅ Gestion des sessions simulée</div>
              <div>✅ Flux vidéo de démonstration</div>
              <div>✅ Chat et interactions fonctionnels</div>
            </div>
            <p className="text-xs mt-3 opacity-75">
              Pour l'intégration production avec Spring Boot + Janus Gateway, consultez le guide d'intégration.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}