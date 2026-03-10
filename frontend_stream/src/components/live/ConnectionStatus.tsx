/**
 * Connection status panel for backend diagnostics.
 */

import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { API_BASE_URL } from '../../lib/api-base-url';
import { config } from '../../lib/config';

interface ConnectionInfo {
  name: string;
  url: string;
  status: 'checking' | 'connected' | 'error' | 'unknown';
  error?: string;
  responseTime?: number;
}

function getWebSocketDebugUrl(): string {
  if (config?.BACKEND?.WEBSOCKET_URL) {
    return config.BACKEND.WEBSOCKET_URL;
  }

  return API_BASE_URL.replace('https:', 'wss:').replace('http:', 'ws:');
}

export function ConnectionStatus() {
  const [connections, setConnections] = useState<ConnectionInfo[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnections = async () => {
    setIsChecking(true);

    const connectionsToCheck: ConnectionInfo[] = [
      {
        name: 'Backend Health',
        url: `${API_BASE_URL}/actuator/health`,
        status: 'checking',
      },
      {
        name: 'OpenAPI Docs',
        url: `${API_BASE_URL}/v3/api-docs`,
        status: 'checking',
      },
    ];

    setConnections(connectionsToCheck);

    const updatedConnections = await Promise.all(
      connectionsToCheck.map(async (connection) => {
        const startTime = Date.now();

        try {
          const response = await fetch(connection.url, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });

          const responseTime = Date.now() - startTime;

          if (!response.ok) {
            return {
              ...connection,
              status: 'error' as const,
              error: `HTTP ${response.status}: ${response.statusText}`,
              responseTime,
            };
          }

          return {
            ...connection,
            status: 'connected' as const,
            responseTime,
          };
        } catch (error) {
          return {
            ...connection,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
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
        return <Badge variant="outline">Verification...</Badge>;
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500">
            Connecte
          </Badge>
        );
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
          <CardTitle className="text-lg">Etat des connexions</CardTitle>
          <Button variant="outline" size="sm" onClick={checkConnections} disabled={isChecking}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-muted rounded-lg p-3">
            <h4 className="font-medium mb-2">Configuration actuelle</h4>
            <div className="space-y-1 text-sm">
              <div>
                <strong>API URL:</strong> <code className="bg-background px-1 rounded">{API_BASE_URL}</code>
              </div>
              <div>
                <strong>WS URL:</strong>{' '}
                <code className="bg-background px-1 rounded">{getWebSocketDebugUrl()}</code>
              </div>
              <div>
                <strong>Environment:</strong>{' '}
                <code className="bg-background px-1 rounded">{config.ENVIRONMENT}</code>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {connections.map((connection, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(connection.status)}
                  <div>
                    <div className="font-medium">{connection.name}</div>
                    <div className="text-sm text-muted-foreground">{connection.url}</div>
                    {connection.error && <div className="text-sm text-red-500 mt-1">{connection.error}</div>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {connection.responseTime && (
                    <span className="text-xs text-muted-foreground">{connection.responseTime}ms</span>
                  )}
                  {getStatusBadge(connection.status)}
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-muted-foreground bg-muted rounded-lg p-3">
            <p className="mb-2">
              <strong>Guide de depannage:</strong>
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Si tout est en erreur: le backend n'est probablement pas demarre.</li>
              <li>Si timeout: verifier la connectivite reseau et le port 8080.</li>
              <li>Si 404: verifier les routes exposees sur le backend.</li>
              <li>Si CORS: verifier la configuration CORS backend.</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
