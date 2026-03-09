/**
 * Service principal de l'application
 * Gère l'initialisation et la configuration des services
 */

import { configUtils, config } from './config';
import { mockDataService } from './mockData';
import { apiService } from './api';

export class AppService {
  private static instance: AppService;
  private initialized = false;
  private services: Map<string, any> = new Map();

  static getInstance(): AppService {
    if (!AppService.instance) {
      AppService.instance = new AppService();
    }
    return AppService.instance;
  }

  /**
   * Initialise l'application et tous ses services
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      configUtils.log('Initializing Stream Éducatif application...');

      // Validation de la configuration
      if (!configUtils.validateConfig()) {
        throw new Error('Invalid application configuration');
      }

      // Initialisation des services de base
      await this.initializeServices();

      // Configuration du mode de données
      this.configurateDataMode();

      // Initialisation de l'API
      await this.initializeAPI();

      this.initialized = true;
      configUtils.log('Application initialized successfully');

      // Émission d'un événement d'initialisation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:initialized', {
          detail: { config, services: Array.from(this.services.keys()) }
        }));
      }

    } catch (error) {
      configUtils.error('Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Initialise les services de base
   */
  private async initializeServices(): Promise<void> {
    // Service de données mock
    this.services.set('mockData', mockDataService);
    
    // Service API
    this.services.set('api', apiService);

    // Service de configuration
    this.services.set('config', config);

    configUtils.debug('Core services initialized');
  }

  /**
   * Configure le mode de données (mock vs real)
   */
  private configurateDataMode(): void {
    if (configUtils.shouldUseMockData()) {
      configUtils.log('Application configured to use mock data');
    } else {
      configUtils.log('Application configured to use real backend data');
    }
  }

  /**
   * Initialise les services API
   */
  private async initializeAPI(): Promise<void> {
    try {
      await apiService.initialize();
      configUtils.log('API service initialized');
    } catch (error) {
      configUtils.warn('API service initialization failed, continuing with mock data:', error);
    }
  }

  /**
   * Obtient un service par son nom
   */
  getService<T>(serviceName: string): T | null {
    return this.services.get(serviceName) || null;
  }

  /**
   * Enregistre un nouveau service
   */
  registerService(name: string, service: any): void {
    this.services.set(name, service);
    configUtils.debug(`Service '${name}' registered`);
  }

  /**
   * Vérifie si l'application est initialisée
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Bascule vers les données réelles (quand le backend est disponible)
   */
  async enableBackendIntegration(backendUrl?: string, websocketUrl?: string): Promise<void> {
    try {
      configUtils.log('Enabling backend integration...');

      // Mettre à jour la configuration
      configUtils.enableBackend(backendUrl, websocketUrl);

      // Réinitialiser le service API avec la nouvelle configuration
      await apiService.initialize();

      configUtils.log('Backend integration enabled successfully');

      // Émission d'un événement de basculement
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app:backend-enabled', {
          detail: { backendUrl: config.BACKEND.SPRING_BOOT_URL }
        }));
      }

    } catch (error) {
      configUtils.error('Failed to enable backend integration:', error);
      throw error;
    }
  }

  /**
   * Retourne aux données mock
   */
  disableBackendIntegration(): void {
    configUtils.log('Disabling backend integration, switching to mock data...');

    configUtils.disableBackend();

    // Émission d'un événement de basculement
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:backend-disabled'));
    }
  }

  /**
   * Obtient l'état de l'application
   */
  getAppState(): {
    initialized: boolean;
    backendEnabled: boolean;
    useMockData: boolean;
    environment: string;
    version: string;
    services: string[];
  } {
    return {
      initialized: this.initialized,
      backendEnabled: configUtils.isBackendEnabled(),
      useMockData: configUtils.shouldUseMockData(),
      environment: configUtils.getEnvironment(),
      version: config.APP_VERSION,
      services: Array.from(this.services.keys())
    };
  }

  /**
   * Diagnostic de l'application
   */
  async runDiagnostics(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warning';
      message: string;
      details?: any;
    }>;
  }> {
    const checks = [];

    // Vérification de l'initialisation
    checks.push({
      name: 'Application Initialization',
      status: this.initialized ? 'pass' : 'fail',
      message: this.initialized ? 'Application is initialized' : 'Application not initialized'
    });

    // Vérification de la configuration
    checks.push({
      name: 'Configuration Validation',
      status: configUtils.validateConfig() ? 'pass' : 'fail',
      message: configUtils.validateConfig() ? 'Configuration is valid' : 'Configuration validation failed'
    });

    // Vérification des services
    const requiredServices = ['mockData', 'api', 'config'];
    const missingServices = requiredServices.filter(service => !this.services.has(service));
    
    checks.push({
      name: 'Core Services',
      status: missingServices.length === 0 ? 'pass' : 'fail',
      message: missingServices.length === 0 ? 'All core services available' : `Missing services: ${missingServices.join(', ')}`,
      details: { available: Array.from(this.services.keys()), missing: missingServices }
    });

    // Vérification du backend (si activé)
    if (configUtils.isBackendEnabled()) {
      try {
        // Test de connectivité simple
        const response = await fetch(config.BACKEND.SPRING_BOOT_URL + '/health', {
          method: 'GET',
          timeout: 5000
        });
        
        checks.push({
          name: 'Backend Connectivity',
          status: response.ok ? 'pass' : 'warning',
          message: response.ok ? 'Backend is reachable' : `Backend returned ${response.status}`
        });
      } catch (error) {
        checks.push({
          name: 'Backend Connectivity',
          status: 'fail',
          message: 'Cannot connect to backend',
          details: error
        });
      }
    } else {
      checks.push({
        name: 'Backend Mode',
        status: 'warning',
        message: 'Using mock data (backend disabled)'
      });
    }

    // Vérification localStorage
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      checks.push({
        name: 'Local Storage',
        status: 'pass',
        message: 'Local storage is available'
      });
    } catch (error) {
      checks.push({
        name: 'Local Storage',
        status: 'warning',
        message: 'Local storage not available',
        details: error
      });
    }

    // Détermination du statut global
    const failedChecks = checks.filter(check => check.status === 'fail');
    const warningChecks = checks.filter(check => check.status === 'warning');

    let status: 'healthy' | 'warning' | 'error';
    if (failedChecks.length > 0) {
      status = 'error';
    } else if (warningChecks.length > 0) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    return { status, checks };
  }

  /**
   * Nettoie les ressources de l'application
   */
  cleanup(): void {
    configUtils.log('Cleaning up application resources...');

    // Nettoyer les services
    this.services.clear();

    // Marquer comme non initialisé
    this.initialized = false;

    // Émission d'un événement de nettoyage
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:cleanup'));
    }
  }

  /**
   * Redémarre l'application
   */
  async restart(): Promise<void> {
    configUtils.log('Restarting application...');
    
    this.cleanup();
    await this.initialize();
    
    configUtils.log('Application restarted successfully');
  }
}

// Instance singleton
export const appService = AppService.getInstance();

// Hook React pour utiliser les services d'application
export function useAppService() {
  return {
    appService,
    initialize: appService.initialize.bind(appService),
    getService: appService.getService.bind(appService),
    getAppState: appService.getAppState.bind(appService),
    runDiagnostics: appService.runDiagnostics.bind(appService),
    enableBackendIntegration: appService.enableBackendIntegration.bind(appService),
    disableBackendIntegration: appService.disableBackendIntegration.bind(appService),
    isInitialized: appService.isInitialized.bind(appService)
  };
}

// Utilitaires pour le développement
export const appUtils = {
  /**
   * Affiche l'état de l'application dans la console
   */
  logAppState: () => {
    if (configUtils.isDevelopment()) {
      console.group('🚀 Stream Éducatif - App State');
      console.table(appService.getAppState());
      console.groupEnd();
    }
  },

  /**
   * Lance un diagnostic complet
   */
  diagnose: async () => {
    if (configUtils.isDevelopment()) {
      const diagnostics = await appService.runDiagnostics();
      console.group('🔍 Stream Éducatif - Diagnostics');
      console.log(`Overall Status: ${diagnostics.status.toUpperCase()}`);
      console.table(diagnostics.checks);
      console.groupEnd();
      return diagnostics;
    }
  },

  /**
   * Bascule le mode de données
   */
  toggleDataMode: async () => {
    if (configUtils.isDevelopment()) {
      if (configUtils.isBackendEnabled()) {
        appService.disableBackendIntegration();
        console.log('🔄 Switched to mock data mode');
      } else {
        try {
          await appService.enableBackendIntegration();
          console.log('🔄 Switched to backend data mode');
        } catch (error) {
          console.error('Failed to enable backend:', error);
        }
      }
    }
  }
};

// Exposition globale pour le debugging en développement
if (typeof window !== 'undefined' && configUtils.isDevelopment()) {
  (window as any).StreamEdu = {
    appService,
    appUtils,
    config,
    mockDataService
  };
}