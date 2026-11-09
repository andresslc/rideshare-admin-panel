import React from "react";
import Button from "../ui/Button";

/**
 * Catches render errors in a page so one bad response doesn't unmount the whole
 * app into a blank screen. Pass `resetKey` (e.g. the pathname) so navigating
 * to another page clears the error.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Page render error:", error, info?.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Something went wrong on this page
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The rest of the panel still works. Try reloading, or go to another section.
        </p>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    );
  }
}

export default ErrorBoundary;
