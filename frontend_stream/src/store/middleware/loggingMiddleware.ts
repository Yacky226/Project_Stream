import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { setPageLoadTime, addApiResponseTime } from '../slices/uiSlice';

interface LogEntry {
  action: string;
  timestamp: number;
  duration?: number;
  success: boolean;
  error?: any;
  metadata?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private pendingActions = new Map<string, number>();
  
  log(entry: LogEntry) {
    this.logs.push(entry);
    
    // Keep only recent logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const style = entry.success ? 'color: green' : 'color: red';
      console.log(
        `%c[${new Date(entry.timestamp).toISOString()}] ${entry.action}`,
        style,
        entry
      );
    }
  }
  
  startAction(actionId: string) {
    this.pendingActions.set(actionId, Date.now());
  }
  
  endAction(actionId: string): number | undefined {
    const startTime = this.pendingActions.get(actionId);
    if (startTime) {
      this.pendingActions.delete(actionId);
      return Date.now() - startTime;
    }
    return undefined;
  }
  
  getRecentLogs(minutes: number = 5): LogEntry[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.logs.filter(log => log.timestamp > cutoff);
  }
  
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => !log.success);
  }
  
  getActionStats(action: string) {
    const actionLogs = this.logs.filter(log => log.action === action);
    const successful = actionLogs.filter(log => log.success);
    const failed = actionLogs.filter(log => !log.success);
    
    const durations = actionLogs
      .map(log => log.duration)
      .filter(d => d !== undefined) as number[];
    
    return {
      total: actionLogs.length,
      successful: successful.length,
      failed: failed.length,
      successRate: actionLogs.length > 0 ? successful.length / actionLogs.length : 0,
      averageDuration: durations.length > 0 ? 
        durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
    };
  }
  
  exportLogs() {
    return {
      logs: this.logs,
      summary: {
        totalActions: this.logs.length,
        successfulActions: this.logs.filter(log => log.success).length,
        failedActions: this.logs.filter(log => !log.success).length,
        timeRange: {
          start: this.logs[0]?.timestamp,
          end: this.logs[this.logs.length - 1]?.timestamp,
        },
      },
    };
  }
}

const logger = new Logger();

export const loggingMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const startTime = Date.now();
  const actionId = `${action.type}-${startTime}`;
  
  // Track action start
  logger.startAction(actionId);
  
  // Get state before action
  const stateBefore = store.getState();
  
  // Execute action
  const result = next(action);
  
  // Get state after action
  const stateAfter = store.getState();
  
  // Calculate duration
  const duration = logger.endAction(actionId);
  
  // Determine if action was successful
  const isSuccess = !action.type.endsWith('/rejected');
  
  // Create log entry
  const logEntry: LogEntry = {
    action: action.type,
    timestamp: startTime,
    duration,
    success: isSuccess,
    error: !isSuccess ? action.payload : undefined,
    metadata: {
      payload: action.payload,
      meta: action.meta,
    },
  };
  
  // Log the action
  logger.log(logEntry);
  
  // Track API response times
  if (action.type.includes('api') && duration) {
    const endpoint = action.type.split('/')[0];
    store.dispatch(addApiResponseTime({ endpoint, time: duration }));
  }
  
  // Track page navigation
  if (action.type === 'ui/setCurrentPath') {
    const pageLoadTime = Date.now() - (window.performance?.timing?.navigationStart || startTime);
    store.dispatch(setPageLoadTime(pageLoadTime));
  }
  
  // Performance monitoring
  if (duration && duration > 5000) { // Actions taking more than 5 seconds
    console.warn(`Slow action detected: ${action.type} took ${duration}ms`);
    
    logger.log({
      action: 'PERFORMANCE_WARNING',
      timestamp: Date.now(),
      success: true,
      metadata: {
        slowAction: action.type,
        duration,
        threshold: 5000,
      },
    });
  }
  
  // State change detection
  if (stateBefore !== stateAfter) {
    const changedSlices = Object.keys(stateAfter).filter(
      key => stateBefore[key as keyof RootState] !== stateAfter[key as keyof RootState]
    );
    
    if (changedSlices.length > 0) {
      logger.log({
        action: 'STATE_CHANGE',
        timestamp: Date.now(),
        success: true,
        metadata: {
          triggerAction: action.type,
          changedSlices,
        },
      });
    }
  }
  
  // Memory usage monitoring (in development)
  if (process.env.NODE_ENV === 'development' && (window as any).performance?.memory) {
    const memory = (window as any).performance.memory;
    if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
      console.warn('Memory usage is high:', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB',
      });
    }
  }
  
  return result;
};

// Export logger for use in components
export { logger };

// Helper function to get action statistics
export const getActionStats = (action: string) => logger.getActionStats(action);

// Helper function to export logs (useful for debugging)
export const exportLogs = () => logger.exportLogs();

// Helper function to get recent error logs
export const getRecentErrors = (minutes: number = 5) => {
  return logger.getRecentLogs(minutes).filter(log => !log.success);
};