/**
 * Base Component
 * A base class for React components that provides common functionality
 * such as error handling, loading state, and error boundaries
 */

import React, { Component, ErrorInfo } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

// Create a mock ErrorService if it doesn't exist yet
export const ErrorService = {
  handleError: (error: Error, context: any) => {
    console.error('Error:', error, 'Context:', context);
  }
};

/**
 * Base props interface
 * Common props that all components extending BaseComponent should have
 */
export interface BaseProps {
  className?: string;
  id?: string;
  testId?: string;
}

/**
 * Base state interface
 * Common state properties that all components extending BaseComponent should have
 */
export interface BaseState {
  loading: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  hasError: boolean;
}

/**
 * Base Component
 * A base class for React components that provides common functionality
 * @template P - Props type extending BaseProps
 * @template S - State type extending BaseState
 */
export class BaseComponent<
  P extends BaseProps = BaseProps,
  S extends BaseState = BaseState
> extends Component<P, S> {
  /**
   * Default state for BaseComponent
   */
  static defaultState: BaseState = {
    loading: false,
    error: null,
    errorInfo: null,
    hasError: false,
  };

  /**
   * Constructor
   * @param props Component props
   */
  constructor(props: P) {
    super(props);
    this.state = { ...BaseComponent.defaultState } as S;
  }

  /**
   * Set loading state
   * @param loading Loading state
   */
  protected setLoading(loading: boolean): void {
    this.setState({ ...this.state, loading } as S);
  }

  /**
   * Handle error
   * @param error Error object
   * @param context Context where the error occurred
   */
  protected handleError(error: unknown, context: string): void {
    console.error(`Error in ${context}:`, error);
    
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // Log the error using ErrorService
    ErrorService.handleError(errorObj, {
      component: this.constructor.name,
      context,
      severity: 'error',
    });
    
    // Update state
    this.setState({
      ...this.state,
      error: errorObj,
      hasError: true,
      loading: false,
    } as S);
  }

  /**
   * Clear error state
   */
  protected clearError(): void {
    this.setState({
      ...this.state,
      error: null,
      errorInfo: null,
      hasError: false,
    } as S);
  }

  /**
   * Component did catch error
   * @param error Error object
   * @param errorInfo Error info
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      ...this.state,
      error,
      errorInfo,
      hasError: true,
      loading: false,
    } as S);
    
    // Log the error using ErrorService
    ErrorService.handleError(error, {
      component: this.constructor.name,
      context: 'componentDidCatch',
      severity: 'error',
      errorInfo,
    });
  }

  /**
   * Render error state
   * @returns Error component
   */
  protected renderError(): React.ReactNode {
    const { error } = this.state;
    
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          <div className="mt-2">
            {error?.message || 'An unknown error occurred'}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => this.clearError()}
          >
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  /**
   * Render loading state
   * @returns Loading component
   */
  protected renderLoading(): React.ReactNode {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /**
   * Render content
   * This method should be overridden by child classes
   * @returns Component content
   */
  protected renderContent(): React.ReactNode {
    return null;
  }

  /**
   * Render component
   * @returns Component JSX
   */
  render(): React.ReactNode {
    const { loading, hasError } = this.state;
    const { className, id, testId } = this.props;
    
    return (
      <div className={className} id={id} data-testid={testId}>
        {hasError && this.renderError()}
        {loading && this.renderLoading()}
        {!hasError && !loading && this.renderContent()}
      </div>
    );
  }
}

/**
 * withErrorBoundary HOC
 * Higher-order component that wraps a component with BaseComponent's error boundary
 * @param WrappedComponent Component to wrap
 * @returns Wrapped component with error boundary
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P & BaseProps> {
  return class WithErrorBoundary extends BaseComponent<BaseProps & P> {
    protected renderContent(): React.ReactNode {
      // Extract BaseProps from this.props
      const { className, id, testId, ...componentProps } = this.props;
      
      // Pass the remaining props to the wrapped component
      return <WrappedComponent {...(componentProps as P)} />;
    }
  };
}

/**
 * withLoading HOC
 * Higher-order component that adds loading state to a component
 * @param WrappedComponent Component to wrap
 * @returns Wrapped component with loading state
 */
export function withLoading<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P & { loading?: boolean }> {
  return class WithLoading extends React.Component<P & { loading?: boolean }> {
    render(): React.ReactNode {
      const { loading, ...props } = this.props;
      
      if (loading) {
        return (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
      }
      
      return <WrappedComponent {...(props as P)} />;
    }
  };
}