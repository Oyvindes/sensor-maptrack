/**
 * Error Service
 * Centralized error handling service for the application
 */

import { toast } from 'sonner';

/**
 * Error severity levels
 */
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Error context interface
 */
export interface ErrorContext {
  component?: string;
  context?: string;
  severity?: ErrorSeverity;
  userId?: string;
  errorInfo?: any;
  [key: string]: any;
}

/**
 * Application error interface
 */
export interface AppError extends Error {
  code?: string;
  severity?: ErrorSeverity;
  context?: ErrorContext;
  timestamp?: Date;
  handled?: boolean;
}

/**
 * Error Service
 * Provides centralized error handling functionality
 */
export class ErrorService {
  /**
   * Error handlers registry
   * Maps error types to handler functions
   */
  private static errorHandlers: Map<string, (error: AppError) => void> = new Map();

  /**
   * Register an error handler for a specific error type
   * @param errorType Error type to handle
   * @param handler Handler function
   */
  public static registerErrorHandler(
    errorType: string,
    handler: (error: AppError) => void
  ): void {
    this.errorHandlers.set(errorType, handler);
  }

  /**
   * Handle an error
   * @param error Error to handle
   * @param context Error context
   * @returns Handled error
   */
  public static handleError(error: Error, context?: ErrorContext): AppError {
    // Create an AppError from the error
    const appError: AppError = this.createAppError(error, context);

    // Log the error
    this.logError(appError);

    // Notify the user if appropriate
    this.notifyUser(appError);

    // Try to find a specific handler for this error
    const errorType = appError.code || appError.name;
    const handler = this.errorHandlers.get(errorType);

    if (handler) {
      handler(appError);
    } else {
      // Use default handler
      this.defaultErrorHandler(appError);
    }

    // Mark as handled
    appError.handled = true;

    return appError;
  }

  /**
   * Create an AppError from an Error
   * @param error Error to convert
   * @param context Error context
   * @returns AppError
   */
  private static createAppError(error: Error, context?: ErrorContext): AppError {
    const appError: AppError = error as AppError;

    // Add additional properties
    appError.severity = context?.severity || 'error';
    appError.context = context || {};
    appError.timestamp = new Date();
    appError.handled = false;

    return appError;
  }

  /**
   * Log an error
   * @param error Error to log
   */
  private static logError(error: AppError): void {
    const { severity, context, timestamp } = error;

    // Log to console based on severity
    switch (severity) {
      case 'info':
        console.info(`[${timestamp?.toISOString()}] [INFO]`, error.message, { error, context });
        break;
      case 'warning':
        console.warn(`[${timestamp?.toISOString()}] [WARNING]`, error.message, { error, context });
        break;
      case 'critical':
        console.error(`[${timestamp?.toISOString()}] [CRITICAL]`, error.message, { error, context });
        break;
      case 'error':
      default:
        console.error(`[${timestamp?.toISOString()}] [ERROR]`, error.message, { error, context });
        break;
    }

    // Here you could also log to a remote error tracking service like Sentry
    // if (process.env.NODE_ENV === 'production') {
    //   captureException(error);
    // }
  }

  /**
   * Notify the user about an error
   * @param error Error to notify about
   */
  private static notifyUser(error: AppError): void {
    const { severity } = error;

    // Only notify the user for certain severities
    if (severity === 'error' || severity === 'critical') {
      toast.error('An error occurred', {
        description: this.getUserFriendlyMessage(error),
        duration: severity === 'critical' ? 10000 : 5000,
      });
    } else if (severity === 'warning') {
      toast.warning('Warning', {
        description: this.getUserFriendlyMessage(error),
        duration: 5000,
      });
    }
  }

  /**
   * Get a user-friendly error message
   * @param error Error to get message for
   * @returns User-friendly message
   */
  private static getUserFriendlyMessage(error: AppError): string {
    // Map known error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'auth/invalid-credentials': 'Invalid email or password. Please try again.',
      'auth/user-not-found': 'User not found. Please check your email or sign up.',
      'auth/email-already-in-use': 'Email already in use. Please use a different email or sign in.',
      'network/disconnected': 'Network connection lost. Please check your internet connection.',
      'server/unavailable': 'Server is currently unavailable. Please try again later.',
      'permission-denied': 'You do not have permission to perform this action.',
      'not-found': 'The requested resource was not found.',
      'validation-error': 'Please check your input and try again.',
    };

    // Try to find a user-friendly message for this error
    if (error.code && errorMessages[error.code]) {
      return errorMessages[error.code];
    }

    // Default message based on severity
    switch (error.severity) {
      case 'critical':
        return 'A critical error occurred. Please contact support.';
      case 'warning':
        return 'Warning: ' + (error.message || 'Something went wrong.');
      case 'info':
        return error.message || 'Information: Something happened.';
      case 'error':
      default:
        return error.message || 'Something went wrong. Please try again.';
    }
  }

  /**
   * Default error handler
   * @param error Error to handle
   */
  private static defaultErrorHandler(error: AppError): void {
    // Default error handling logic
    if (error.severity === 'critical') {
      // For critical errors, we might want to redirect to an error page
      // or perform some recovery action
      console.error('Critical error occurred:', error);
    }
  }

  /**
   * Create a new error with the given message and context
   * @param message Error message
   * @param context Error context
   * @returns AppError
   */
  public static createError(message: string, context?: ErrorContext): AppError {
    const error = new Error(message) as AppError;
    return this.createAppError(error, context);
  }

  /**
   * Wrap a function with error handling
   * @param fn Function to wrap
   * @param context Error context
   * @returns Wrapped function
   */
  public static withErrorHandling<T extends (...args: any[]) => any>(
    fn: T,
    context?: ErrorContext
  ): (...args: Parameters<T>) => ReturnType<T> | undefined {
    return (...args: Parameters<T>): ReturnType<T> | undefined => {
      try {
        return fn(...args);
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)), context);
        return undefined;
      }
    };
  }

  /**
   * Wrap an async function with error handling
   * @param fn Async function to wrap
   * @param context Error context
   * @returns Wrapped async function
   */
  public static withAsyncErrorHandling<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context?: ErrorContext
  ): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>> | undefined> {
    return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleError(error instanceof Error ? error : new Error(String(error)), context);
        return undefined;
      }
    };
  }
}

// Register some common error handlers
ErrorService.registerErrorHandler('auth/invalid-credentials', (error) => {
  console.log('Invalid credentials error handler:', error);
  // Custom handling for invalid credentials
});

ErrorService.registerErrorHandler('network/disconnected', (error) => {
  console.log('Network disconnected error handler:', error);
  // Custom handling for network disconnection
});