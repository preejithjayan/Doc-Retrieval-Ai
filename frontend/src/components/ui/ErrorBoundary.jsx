import { Component } from 'react';

import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="glass-panel neural-outline max-w-lg rounded-[32px] p-10 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-cyan/70">System Fault</p>
            <h1 className="mt-4 font-display text-3xl font-semibold">The interface hit an unexpected state.</h1>
            <p className="mt-4 text-sm text-slate-300">
              The safest next step is a clean reload. If this keeps happening, there may be a backend contract issue we still need to iron out.
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={this.handleRetry}>Retry</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
