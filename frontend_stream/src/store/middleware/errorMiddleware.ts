import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../index';
import { addError, showError, incrementWarningCount } from '../slices/uiSlice';

export const errorMiddleware: Middleware<{}, RootState> = (store) => (next) => (action) => {
  const result = next(action);
  
  // Handle rejected actions (errors)
  if (action.type.endsWith('/rejected')) {
    const error = action.payload as any;
    const actionType = action.type.replace('/rejected', '');
    
    // Determine error severity
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    if (error?.status) {
      if (error.status >= 500) {
        severity = 'critical';
      } else if (error.status >= 400) {
        severity = 'medium';
      } else {
        severity = 'low';
      }
    }
    
    // Special handling for critical errors
    if (severity === 'critical') {
      store.dispatch(addError({
        code: error.code || 'UNKNOWN_ERROR',
        message: error.message || 'A critical error occurred',
        context: {
          action: actionType,
          originalError: error,
          timestamp: Date.now(),
        },
        severity,
      }));
      
      // Show immediate notification for critical errors
      store.dispatch(showError('A critical error occurred. Please try again or contact support.'));
    }
    
    // Handle network errors
    if (error.name === 'NetworkError' || error.code === 'NETWORK_ERROR') {
      store.dispatch(showError('Network error. Please check your connection and try again.'));
      
      store.dispatch(addError({
        code: 'NETWORK_ERROR',
        message: 'Network connection failed',
        context: { action: actionType },
        severity: 'high',
      }));
    }
    
    // Handle timeout errors
    if (error.name === 'TimeoutError' || error.code === 'TIMEOUT') {
      store.dispatch(showError('Request timed out. Please try again.'));
      
      store.dispatch(addError({
        code: 'TIMEOUT',
        message: 'Request timed out',
        context: { action: actionType },
        severity: 'medium',
      }));
    }
    
    // Handle validation errors
    if (error.status === 400 && error.code === 'VALIDATION_ERROR') {
      const validationMessage = error.data?.details?.join(', ') || 'Please check your input and try again.';
      store.dispatch(showError(validationMessage));
    }
    
    // Log error for debugging
    console.error(`Action ${actionType} failed:`, {
      error,
      action,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Handle warnings
  if (action.type.endsWith('/pending') && action.meta?.arg?.showWarning) {
    store.dispatch(incrementWarningCount());
  }
  
  // Monitor for memory leaks (too many errors)
  if (action.type === 'ui/addError') {
    const state = store.getState();
    if (state.ui.errors.length > 100) {
      console.warn('Too many errors accumulated. This might indicate a serious issue.');
      
      // Auto-clear old errors to prevent memory issues
      const criticalErrors = state.ui.errors.filter(err => err.severity === 'critical');
      if (criticalErrors.length < 10) {
        // Keep only critical errors and clear the rest
        // This would require a new action in uiSlice
      }
    }
  }
  
  // Track error patterns
  if (action.type.endsWith('/rejected')) {
    const state = store.getState();
    const recentErrors = state.ui.errors.filter(
      err => Date.now() - err.timestamp < 60000 // Last minute
    );
    
    if (recentErrors.length > 5) {
      console.warn('High error rate detected. Possible system issue.');
      
      store.dispatch(addError({
        code: 'HIGH_ERROR_RATE',
        message: 'High error rate detected',
        context: { 
          recentErrorCount: recentErrors.length,
          timeWindow: '1 minute' 
        },
        severity: 'high',
      }));
    }
  }
  
  return result;
};