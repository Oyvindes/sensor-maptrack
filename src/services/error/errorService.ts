/**
 * Error Service
 * Provides standardized error handling and logging functionality
 */

import { toast } from 'sonner';

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error source categories
export enum ErrorSource {
  API = 'api',
  DATABASE = 'database',
  UI = 'ui',
  AUTH = 'auth',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

// Error context interface
export interface ErrorContext {
  operation: string;
  component?: string;
  additionalData?: Record<string, any>;
  userId?: string;
}

// Structured error interface
export interface StructuredError {
  message: string;
  severity: ErrorSeverity;
  source: ErrorSource;
  context: ErrorContext;
  originalError?: any;
  timestamp: string;
  stack?: string;
}

/**
 * Create a structured error object
 * @param message Error message
 * @param severity Error severity
 * @param source Error source
 * @param context Error context
 * @param originalError Original error object
 * @returns Structured error object
 */
export function createError(
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  source: ErrorSource = ErrorSource.UNKNOWN,
  context: ErrorContext,
  originalError?: any
): StructuredError {
  return {
    message,
    severity,
    source,
    context,
    originalError,
    timestamp: new Date().toISOString(),
    stack: originalError?.stack || new Error().stack
  };
}

/**
 * Handle an error with standardized logging and user notification
 * @param error Error to handle
 * @param notifyUser Whether to notify the user
 * @returns The structured error
 */
export function handleError(
  error: Error | string | StructuredError,
  notifyUser = true
): StructuredError {
  // Convert to structured error if needed
  const structuredError = isStructuredError(error)
    ? error
    : createError(
        typeof error === 'string' ? error : error.message,
        ErrorSeverity.ERROR,
        ErrorSource.UNKNOWN,
        { operation: 'unknown' },
        typeof error === 'string' ? undefined : error
      );

  // Log the error
  logError(structuredError);

  // Notify the user if requested
  if (notifyUser) {
    notifyUserOfError(structuredError);
  }

  return structuredError;
}

/**
 * Check if an error is a structured error
 * @param error Error to check
 * @returns Whether the error is a structured error
 */
function isStructuredError(error: any): error is StructuredError {
  return (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    'severity' in error &&
    'source' in error &&
    'context' in error &&
    'timestamp' in error
  );
}

/**
 * Log an error to the console
 * @param error Error to log
 */
function logError(error: StructuredError): void {
  // Format the error for logging
  const logMessage = `[${error.severity.toUpperCase()}] [${error.source}] ${error.message}`;
  const logContext = {
    context: error.context,
    timestamp: error.timestamp,
    originalError: error.originalError
  };

  // Log based on severity
  switch (error.severity) {
    case ErrorSeverity.INFO:
      console.info(logMessage, logContext);
      break;
    case ErrorSeverity.WARNING:
      console.warn(logMessage, logContext);
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      console.error(logMessage, logContext);
      break;
    default:
      console.log(logMessage, logContext);
  }

  // Here you could also send the error to a monitoring service like Sentry
  // if (process.env.NODE_ENV === 'production') {
  //   sendToMonitoringService(error);
  // }
}

/**
 * Notify the user of an error
 * @param error Error to notify about
 */
function notifyUserOfError(error: StructuredError): void {
  // Format a user-friendly message
  let userMessage = error.message;

  // For critical errors, add additional context
  if (error.severity === ErrorSeverity.CRITICAL) {
    userMessage = `Critical error: ${userMessage}. Please try again later or contact support.`;
  }

  // Show toast notification based on severity
  switch (error.severity) {
    case ErrorSeverity.INFO:
      toast.info(userMessage);
      break;
    case ErrorSeverity.WARNING:
      toast.warning(userMessage);
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      toast.error(userMessage);
      break;
    default:
      toast(userMessage);
  }
}

/**
 * Create a database error
 * @param message Error message
 * @param operation Database operation
 * @param additionalData Additional error data
 * @param originalError Original error object
 * @returns Structured error
 */
export function createDatabaseError(
  message: string,
  operation: string,
  additionalData?: Record<string, any>,
  originalError?: any
): StructuredError {
  return createError(
    message,
    ErrorSeverity.ERROR,
    ErrorSource.DATABASE,
    {
      operation,
      additionalData
    },
    originalError
  );
}

/**
 * Create an API error
 * @param message Error message
 * @param operation API operation
 * @param additionalData Additional error data
 * @param originalError Original error object
 * @returns Structured error
 */
export function createApiError(
  message: string,
  operation: string,
  additionalData?: Record<string, any>,
  originalError?: any
): StructuredError {
  return createError(
    message,
    ErrorSeverity.ERROR,
    ErrorSource.API,
    {
      operation,
      additionalData
    },
    originalError
  );
}

/**
 * Create an authentication error
 * @param message Error message
 * @param operation Authentication operation
 * @param additionalData Additional error data
 * @param originalError Original error object
 * @returns Structured error
 */
export function createAuthError(
  message: string,
  operation: string,
  additionalData?: Record<string, any>,
  originalError?: any
): StructuredError {
  return createError(
    message,
    ErrorSeverity.ERROR,
    ErrorSource.AUTH,
    {
      operation,
      additionalData
    },
    originalError
  );
}

/**
 * Try to execute a function and handle any errors
 * @param fn Function to execute
 * @param errorContext Error context
 * @param notifyUser Whether to notify the user of errors
 * @returns Result of the function or null if an error occurred
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  errorContext: ErrorContext,
  notifyUser = true
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(
      createError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        ErrorSeverity.ERROR,
        ErrorSource.UNKNOWN,
        errorContext,
        error
      ),
      notifyUser
    );
    return null;
  }
}

/**
 * Error service singleton
 */
export const ErrorService = {
  createError,
  handleError,
  createDatabaseError,
  createApiError,
  createAuthError,
  tryCatch
};

export default ErrorService;