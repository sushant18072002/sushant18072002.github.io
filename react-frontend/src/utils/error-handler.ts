// Error handling utilities
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleApiError = (error: any): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error?.response) {
    // HTTP error response
    return new AppError(
      error.response.data?.message || 'An error occurred',
      error.response.data?.code,
      error.response.status,
      error.response.data
    );
  }

  if (error?.message) {
    // Network or other errors
    return new AppError(error.message);
  }

  // Unknown error
  return new AppError('An unexpected error occurred');
};

export const getErrorMessage = (error: any): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

// User-friendly error messages
export const getUserFriendlyMessage = (error: AppError): string => {
  const errorMap: Record<string, string> = {
    'NETWORK_ERROR': 'Please check your internet connection and try again.',
    'TIMEOUT_ERROR': 'The request took too long. Please try again.',
    'VALIDATION_ERROR': 'Please check your input and try again.',
    'NOT_FOUND': 'The requested resource was not found.',
    'UNAUTHORIZED': 'Please log in to continue.',
    'FORBIDDEN': 'You do not have permission to perform this action.',
    'SERVER_ERROR': 'Something went wrong on our end. Please try again later.',
  };

  return errorMap[error.code || ''] || error.message || 'An unexpected error occurred';
};