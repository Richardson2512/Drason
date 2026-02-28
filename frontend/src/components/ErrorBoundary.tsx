'use client';

import React from 'react';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary that catches render errors in child components.
 * Prevents the entire app from crashing to a blank screen.
 */
export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null });
    };

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px',
                    padding: '2rem',
                    textAlign: 'center',
                    gap: '1rem',
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#FEF2F2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                    }}>
                        !
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1F2937', fontWeight: 600 }}>
                        Something went wrong
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#6B7280', maxWidth: '400px' }}>
                        An unexpected error occurred while rendering this page. You can try again or navigate to a different page.
                    </p>
                    {process.env.NODE_ENV !== 'production' && this.state.error && (
                        <pre style={{
                            background: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: '8px',
                            padding: '1rem',
                            fontSize: '0.75rem',
                            color: '#DC2626',
                            maxWidth: '600px',
                            overflow: 'auto',
                            textAlign: 'left',
                        }}>
                            {this.state.error.message}
                        </pre>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={this.handleRetry}
                            style={{
                                padding: '0.5rem 1.25rem',
                                background: '#3B82F6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            style={{
                                padding: '0.5rem 1.25rem',
                                background: '#F3F4F6',
                                color: '#374151',
                                border: '1px solid #D1D5DB',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                            }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
