import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <main className="error-boundary">
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred.</p>
          <button
            className="error-boundary-button"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
