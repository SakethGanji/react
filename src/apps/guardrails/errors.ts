// Typed API errors for better error handling

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SERVER_ERROR'
  | 'UNKNOWN'

export class ApiError extends Error {
  public readonly code: ApiErrorCode
  public readonly status?: number
  public readonly endpoint: string

  constructor(message: string, code: ApiErrorCode, endpoint: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.endpoint = endpoint
  }

  static fromResponse(response: Response, endpoint: string): ApiError {
    const status = response.status
    let code: ApiErrorCode
    let message: string

    switch (true) {
      case status === 401:
        code = 'UNAUTHORIZED'
        message = 'Authentication required'
        break
      case status === 403:
        code = 'FORBIDDEN'
        message = 'Access denied'
        break
      case status === 404:
        code = 'NOT_FOUND'
        message = 'Resource not found'
        break
      case status >= 500:
        code = 'SERVER_ERROR'
        message = 'Server error occurred'
        break
      default:
        code = 'UNKNOWN'
        message = `Request failed with status ${status}`
    }

    return new ApiError(message, code, endpoint, status)
  }

  static networkError(endpoint: string, originalError?: Error): ApiError {
    return new ApiError(
      originalError?.message || 'Network request failed',
      'NETWORK_ERROR',
      endpoint
    )
  }
}

// User-friendly error messages
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect. Please check your network.'
      case 'UNAUTHORIZED':
        return 'Please log in to continue.'
      case 'FORBIDDEN':
        return 'You don\'t have permission to view this.'
      case 'NOT_FOUND':
        return 'The requested data was not found.'
      case 'SERVER_ERROR':
        return 'Something went wrong. Please try again later.'
      default:
        return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}
