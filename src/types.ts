/**
 * Configuration for the Prescribery client
 */
export type PrescriberyConfig = {
  apiKey: string;
  environment: "production" | "staging";
};

/**
 * Environment-specific URLs
 */
export type EnvironmentUrls = {
  production: "https://staff.prescribery.com/api/dtg/v1";
  staging: "https://staging.doctalkgo.com/api/dtg/v1";
};

export type PrescriberySuccessResponse<T> = {
  code: 0;
  message: string;
} & T;

export type PrescriberyErrorResponse = {
  code: 1;
  message: string;
  reason?: {
    [key: string]: string[];
  };
};

/**
 * Normalized response format for all endpoints
 */
export type PrescriberyResponse<T> =
  | PrescriberySuccessResponse<T>
  | PrescriberyErrorResponse;

export type PrescriberyAlternativeResponse<T> = {
  status: boolean | "failed";
  message: string;
  data?: T;
};

/**
 * HTTP methods supported by the client
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/**
 * Valid request body types
 */
export type RequestBody =
  | string
  | Record<string, unknown>
  | URLSearchParams
  | FormData
  | unknown;

/**
 * Query parameter object type
 */
export type QueryParams = Record<string, string | number | boolean>;

/**
 * HTTP headers type
 */
export type HttpHeaders = Record<string, string>;

/**
 * Request configuration options
 */
export type RequestOptions<TBody = unknown> = {
  accessToken: string;
  body?: TBody;
  query?: QueryParams;
  headers?: HttpHeaders;
};

/**
 * HTTP response structure
 */
export type HttpResponse<T> = {
  data: T;
  status: number;
  headers: HttpHeaders;
};

/**
 * Client configuration options
 */
export type HttpsClientConfig = {
  baseURL: string;
  timeout?: number;
  headers?: HttpHeaders;
};

/**
 * Error context information
 */
export type ErrorContext = {
  method: HttpMethod;
  url: string;
  status?: number;
  response?: string;
};

/**
 * Network error type definition
 */
export type NetworkErrorType = "DNS" | "CONNECTION" | "TIMEOUT" | "UNKNOWN";

/**
 * Timeout error type definition
 */
export type TimeoutErrorType = "REQUEST_TIMEOUT";

/**
 * HTTP error type definition
 */
export type HttpErrorType = "HTTP_ERROR";

/**
 * Parse error type definition
 */
export type ParseErrorType = "JSON_PARSE" | "UNKNOWN_FORMAT";
