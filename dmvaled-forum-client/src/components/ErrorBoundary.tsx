import React from "react";
import "./ErrorBoundary.css";

interface ErrorBoundaryProps {
  children: React.ReactNode[];
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  info: object;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: new Error(),
      info: { componentStack: "" },
    };
  }

  static getDerivedStateFromError = (error: Error) => {
    // Changing the state if some error occurs
    return { hasError: true };
  };

  componentDidCatch(error: Error | null, info: object) {
    // We can also run our own code here to log errors and notify support if needed. (p. 346)
    console.log("info", info);
    this.setState({ hasError: true, error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2 style={{ padding: "2em" }}>
            Something has gone wrong. Please reload your screen.
          </h2>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
