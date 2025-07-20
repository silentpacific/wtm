// src/services/errorTracking.ts
import { supabase } from './supabaseClient';

interface ErrorReport {
  error_message: string;
  error_stack?: string;
  user_id?: string;
  user_agent: string;
  url: string;
  timestamp: string;
  context?: Record<string, any>;
  error_type: 'menu_scan' | 'dish_explanation' | 'payment' | 'general';
}

// Store errors in Supabase database
const saveErrorToDatabase = async (errorReport: ErrorReport) => {
  try {
    const { error } = await supabase
      .from('error_logs')
      .insert({
        error_message: errorReport.error_message,
        error_stack: errorReport.error_stack,
        user_id: errorReport.user_id,
        user_agent: errorReport.user_agent,
        url: errorReport.url,
        error_type: errorReport.error_type,
        context: errorReport.context,
      });
      
    if (error) {
      console.error('Failed to save error to database:', error);
    } else {
      console.log('✅ Error logged to database');
    }
  } catch (e) {
    console.error('❌ Error saving error report:', e);
  }
};

// Error filtering - only log critical errors
const shouldLogError = (error: Error, context: Record<string, any> = {}): boolean => {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';
  
  // ❌ IGNORE: Non-critical errors
  const ignoredErrors = [
    // Browser extension errors
    'non-error promise rejection captured',
    'extension context invalidated',
    'chrome-extension',
    'moz-extension',
    'safari-extension',
    
    // Network errors that are expected
    'network error',
    'fetch failed',
    'load failed',
    'connection refused',
    
    // Common browser/user action errors
    'user aborted',
    'user cancelled',
    'operation was aborted',
    'the request was interrupted',
    
    // React development warnings
    'warning: ',
    'you are importing createroot',
    'react-dom',
    
    // Common non-critical errors
    'script error',
    'non-error promise rejection',
    'undefined is not an object',
    'null is not an object',
    'can\'t find variable',
    
    // Third-party script errors (ads, analytics, etc)
    'google',
    'facebook',
    'twitter',
    'analytics',
    'gtag',
    'clarity',
    
    // CORS errors from external resources
    'cross-origin',
    'cors',
  ];
  
  // Check if error should be ignored
  for (const ignored of ignoredErrors) {
    if (errorMessage.includes(ignored) || errorStack.includes(ignored)) {
      console.log(`🚫 Ignoring non-critical error: ${error.message}`);
      return false;
    }
  }
  
  // ✅ ALWAYS LOG: Critical application errors
  const criticalKeywords = [
    // Payment related
    'payment', 'stripe', 'checkout',
    
    // Core app functionality
    'menu', 'scan', 'dish', 'explanation', 'gemini',
    
    // Authentication
    'auth', 'login', 'signup', 'supabase',
    
    // Database errors
    'database', 'sql', 'query',
    
    // API errors
    'api key', 'unauthorized', 'forbidden',
  ];
  
  for (const critical of criticalKeywords) {
    if (errorMessage.includes(critical) || errorStack.includes(critical)) {
      console.log(`🔴 Critical error detected: ${error.message}`);
      return true;
    }
  }
  
  // ✅ LOG: Errors from your own code (not third-party)
  const isFromOwnCode = errorStack.includes('whatthemenu') || 
                       errorStack.includes('localhost') ||
                       errorStack.includes('your-domain.com') ||
                       context.type === 'manual_capture';
  
  if (isFromOwnCode) {
    console.log(`🟡 Own code error: ${error.message}`);
    return true;
  }
  
  // ❌ Default: Don't log unknown/third-party errors
  console.log(`⚪ Ignoring third-party error: ${error.message}`);
  return false;
};

// Enhanced console logging for development
const enhancedConsoleLog = (error: Error, context: Record<string, any>, shouldLog: boolean) => {
  const logType = shouldLog ? '🚨 CRITICAL ERROR CAPTURED' : '📝 ERROR LOGGED (DEV ONLY)';
  
  console.group(`${logType}: ${error.message}`);
  console.error('📍 Error Object:', error);
  console.error('📋 Stack Trace:', error.stack);
  console.table(context);
  console.info('🕐 Time:', new Date().toLocaleString());
  console.info('🌐 URL:', window.location.href);
  console.info('💾 Will save to DB:', shouldLog);
  console.groupEnd();
};

// Get current user if available
const getCurrentUser = () => {
  try {
    // Try to get user from auth context
    const authUser = supabase.auth.getUser();
    return authUser;
  } catch {
    return null;
  }
};

export const initErrorTracking = () => {
  console.log('🔧 Initializing smart error tracking...');
  
  // Global error handler with filtering
  window.addEventListener('error', async (event) => {
    const error = event.error || new Error(event.message);
    const context = {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'javascript_error'
    };
    
    // Check if we should log this error
    const shouldLog = shouldLogError(error, context);
    
    // Always log to console for development
    enhancedConsoleLog(error, context, shouldLog);
    
    // Only save critical errors to database
    if (shouldLog) {
      const user = await getCurrentUser();
      
      const errorReport: ErrorReport = {
        error_message: event.message,
        error_stack: error.stack,
        user_id: user?.data.user?.id,
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        error_type: 'general',
        context
      };
      
      await saveErrorToDatabase(errorReport);
    }
  });

  // Unhandled promise rejections with filtering
  window.addEventListener('unhandledrejection', async (event) => {
    const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
    const context = {
      reason: String(event.reason),
      type: 'unhandled_promise_rejection'
    };
    
    // Check if we should log this error
    const shouldLog = shouldLogError(error, context);
    
    // Always log to console for development
    enhancedConsoleLog(error, context, shouldLog);
    
    // Only save critical errors to database
    if (shouldLog) {
      const user = await getCurrentUser();
      
      const errorReport: ErrorReport = {
        error_message: error.message,
        user_id: user?.data.user?.id,
        user_agent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        error_type: 'general',
        context
      };
      
      await saveErrorToDatabase(errorReport);
    }
  });
  
  console.log('✅ Smart error tracking initialized');
};

// Manual error capture (always logs since it's intentional)
export const captureError = async (
  error: Error, 
  errorType: ErrorReport['error_type'],
  context: Record<string, any> = {}
) => {
  const user = await getCurrentUser();
  
  // Manual captures are always considered critical
  const enhancedContext = {
    ...context,
    type: 'manual_capture',
    intentional: true
  };
  
  const errorReport: ErrorReport = {
    error_message: error.message,
    error_stack: error.stack,
    user_id: user?.data.user?.id,
    user_agent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    error_type: errorType,
    context: enhancedContext,
  };
  
  enhancedConsoleLog(error, enhancedContext, true);
  await saveErrorToDatabase(errorReport);
  
  // Also track in Google Analytics if available
  if (typeof gtag !== 'undefined') {
    gtag('event', 'exception', {
      description: error.message,
      fatal: false,
      custom_map: {
        error_type: errorType,
        ...context
      }
    });
  }
};

// Specialized capture functions
export const captureMenuScanError = (error: Error, context: Record<string, any> = {}) => {
  return captureError(error, 'menu_scan', {
    ...context,
    feature: 'menu_scanning'
  });
};

export const captureDishExplanationError = (error: Error, context: Record<string, any> = {}) => {
  return captureError(error, 'dish_explanation', {
    ...context,
    feature: 'dish_explanation'
  });
};

export const capturePaymentError = (error: Error, context: Record<string, any> = {}) => {
  return captureError(error, 'payment', {
    ...context,
    feature: 'payment_processing'
  });
};