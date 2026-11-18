import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { Language } from '../types/scan';
import { ErrorView } from './ErrorView';

interface ErrorBoundaryProps {
  children: ReactNode;
  lang: Language;
  onResetHome: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo): void {
    // Error captured cleanly by ErrorBoundary without exposing internal stack traces in UI
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorView
          lang={this.props.lang}
          code="500"
          onGoHome={() => {
            this.setState({ hasError: false });
            this.props.onResetHome();
          }}
          onRetry={() => {
            this.setState({ hasError: false });
          }}
        />
      );
    }

    return this.props.children;
  }
}
