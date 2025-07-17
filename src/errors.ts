import type { HttpMethod, ErrorContext } from "./types";

/**
 * Base error class for all HTTP client errors
 */
export class HttpClientError extends Error {
  constructor(message: string, public context: ErrorContext) {
    super(message);
    this.name = "HttpClientError";
  }
}

/**
 * Network-level error (DNS, connection, etc.)
 */
export class NetworkError extends HttpClientError {
  constructor(
    message: string,
    context: ErrorContext,
    public type: "DNS" | "CONNECTION" | "TIMEOUT" | "UNKNOWN" = "UNKNOWN"
  ) {
    super(message, context);
    this.name = "NetworkError";
  }
}

/**
 * Request timeout error
 */
export class TimeoutError extends HttpClientError {
  constructor(message: string, context: ErrorContext) {
    super(message, context);
    this.name = "TimeoutError";
  }
}

/**
 * HTTP status code >= 400 error
 */
export class HttpError extends HttpClientError {
  constructor(message: string, context: ErrorContext & { status: number }) {
    super(message, context);
    this.name = "HttpError";
  }

  get status(): number {
    return this.context.status!;
  }
}

/**
 * Response parsing error
 */
export class ParseError extends HttpClientError {
  constructor(
    message: string,
    context: ErrorContext,
    public originalError?: Error
  ) {
    super(message, context);
    this.name = "ParseError";
  }
}

/**
 * API-specific error with field-level validation details
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public errors?: {
      [key: string]: string[];
    }
  ) {
    super(message);
    this.name = "ApiError";
  }
}
