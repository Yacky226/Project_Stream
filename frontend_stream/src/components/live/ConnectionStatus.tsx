/**
 * Connection Status Component
 * Affiche l'état des connexions backend pour le debugging
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { config } from '../../lib/config';

interface ConnectionInfo {
  name: string;
  url: string;
  status: 'checking' | 'connected' | 'error' | 'unknown';
  error?: string;
  responseTime?: number;
}

export function ConnectionStatus() {
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnections = async () => {
    setIsChecking(true);
    
    const connectionsToCheck: ConnectionInfo[] = [
      {
        name: 'Supabase Server Health',
        url: `${config.API_URL}/health`,
        status: 'checking'
      },
      {
        name: 'Configuration Endpoint',
        url: `${config.API_URL}/config`,
        status: 'checking'
      }
    ];

    setConnections(connectionsToCheck);

    const updatedConnections = await Promise.all(
      connectionsToCheck.map(async (connection) => {
        const startTime = Date.now();
        
        try {
          console.log(`🔍 Checking connection to: ${connection.url}`);
          
          const response = await fetch(connection.url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          const responseTime = Date.now() - startTime;
          
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${connection.name} responded:`, data);
            
            return {
              ...connection,
              status: 'connected' as const,
              responseTime
            };
          } else {
            console.warn(`⚠️ ${connection.name} returned ${response.status}:`, response.statusText);
            
            return {
              ...connection,
              status: 'error' as const,
              error: `HTTP ${response.status}: ${response.statusText}`,
              responseTime
            };
          }
        } catch (error) {
          console.error(`❌ ${connection.name} failed:`, error);
          
          return {
            ...connection,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    setConnections(updatedConnections);
    setIsChecking(false);
  };

  useEffect(() => {
    checkConnections();
  }, []);

  const getStatusIcon = (status: ConnectionInfo['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ConnectionInfo['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="outline">Vérification...</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connecté</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">État des Connexions</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={checkConnections}
            disabled={isChecking}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Configuration Info */}
          <div className="bg-muted rounded-lg p-3">
            <h4 className="font-medium mb-2">Configuration Actuelle</h4>
            <div className="space-y-1 text-sm">
              <div><strong>API URL:</strong> <code className="bg-background px-1 rounded">{config.API_URL}</code></div>
              <div><strong>WS URL:</strong> <code className="bg-background px-1 rounded">{config.WS_URL}</code></div>
              <div><strong>Environment:</strong> <code className="bg-background px-1 rounded">{config.ENVIRONMENT}</code></div>
            </div>
          </div>

          {/* Connections Status */}
          <div className="space-y-3">
            {connections.map((connection, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(connection.status)}
                  <div>
                    <div className="font-medium">{connection.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {connection.url}
                    </div>
                    {connection.error && (
                      <div className="text-sm text-red-500 mt-1">
                        {connection.error}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {connection.responseTime && (
                    <span className="text-xs text-muted-foreground">
                      {connection.responseTime}ms
                    </span>
                  )}
                  {getStatusBadge(connection.status)}
                </div>
              </div>
            ))}
          </div>

          {/* Help Text */}
          <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
            <p className="mb-2"><strong>💡 Guide de dépannage :</strong></p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Si tout est en erreur : Le serveur Supabase n'est peut-être pas démarré</li>
              <li>Si timeout : Vérifiez la connectivité réseau</li>
              <li>Si 404 : Les routes du serveur ne sont pas correctement configurées</li>
              <li>Si CORS : Problème de configuration des headers</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}