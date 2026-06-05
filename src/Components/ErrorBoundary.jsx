import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f1923",
            color: "#fff",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <i className="fas fa-triangle-exclamation" style={{ fontSize: "3rem", color: "#e0a800", opacity: 0.7 }}></i>
          <h2 style={{ margin: 0, fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", maxWidth: "420px", lineHeight: 1.6 }}>
            This page ran into an unexpected error. Try refreshing, or go back to the previous page.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "0.5rem 1.25rem",
                background: "#1a6b8a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <i className="fas fa-rotate-right me-2"></i>Refresh
            </button>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.history.back(); }}
              style={{
                padding: "0.5rem 1.25rem",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <i className="fas fa-arrow-left me-2"></i>Go Back
            </button>
          </div>
          {this.state.error && (
            <pre
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(255,0,0,0.1)",
                border: "1px solid rgba(255,0,0,0.2)",
                borderRadius: "8px",
                color: "#ff6b6b",
                fontSize: "0.75rem",
                maxWidth: "600px",
                overflow: "auto",
                textAlign: "left",
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
