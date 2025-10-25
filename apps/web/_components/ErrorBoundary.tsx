"use client";

import React, { useState, useEffect } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      if (event.message?.includes('chunk') || event.message?.includes('Loading chunk')) {
        console.warn('Chunk loading error detected:', event.message);
        setError(new Error(event.message));
        setHasError(true);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('chunk') || 
          event.reason?.message?.includes('Loading chunk')) {
        console.warn('Chunk loading promise rejection:', event.reason);
        setError(new Error(event.reason?.message || 'Chunk loading failed'));
        setHasError(true);
      }
    };

    window.addEventListener('error', handleChunkError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleChunkError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const retry = () => {
    setHasError(false);
    setError(undefined);
    // Force a page reload to clear any chunk loading issues
    window.location.reload();
  };

  if (hasError) {
    if (fallback) {
      const FallbackComponent = fallback;
      return <FallbackComponent error={error} retry={retry} />;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
              Something went wrong
            </h2>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error?.message?.includes('chunk') 
              ? 'There was an issue loading the application. This is usually a temporary issue.'
              : 'An unexpected error occurred. Please try refreshing the page.'
            }
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={retry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
