/**
 * Standard API Envelopes, Request/Response DTOs & Error Contracts
 */

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

export interface ApiErrorDetail {
  field?: string;
  code: string;
  message: string;
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
  meta?: {
    timestamp: number;
  };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

