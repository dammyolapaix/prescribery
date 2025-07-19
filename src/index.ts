/**
 * @fileoverview Prescribery TypeScript Client - A zero-dependency, fully type-safe client for the Prescribery API
 *
 * This package provides a modern, type-safe client for the Prescribery API with:
 * - Resource-based API organization
 * - Zero dependencies (uses only Node.js built-ins)
 * - Full TypeScript support with generics
 * - Domain-specific APIs for better developer experience
 *
 * @example
 * ```typescript
 * import { Prescribery } from 'prescribery'
 *
 * const prescribery = new Prescribery({
 *   apiKey: 'your-api-key-here',
 *   environment: 'production', // or 'staging'
 *   debug: true
 * })
 *
 * // Generate access token
 * const tokenResponse = await prescribery.token.accessToken()
 *
 * // List patients
 * const patients = await prescribery.patients.list(tokenResponse.access_token, {
 *   facility_id: 'facility123',
 *   record_id: 'record456'
 * })
 *
 * if (isSuccess(patients)) {
 *   console.log('Patients:', patients.data?.members)
 * } else if (isError(patients)) {
 *   console.error('Error:', patients.message)
 * }
 * ```
 *
 * @version 1.0.0
 * @author Prescribery Team
 * @license MIT
 */

// Main Prescribery client
export { Prescribery } from "./prescribery";

// Core type exports
export type {
  PrescriberyConfig,
  PrescriberyResponse,
  PrescriberySuccessResponse,
  PrescriberyErrorResponse,
  PrescriberyAlternativeResponse,
  HttpMethod,
  RequestBody,
  QueryParams,
  HttpHeaders,
  RequestOptions,
  HttpResponse,
  HttpsClientConfig,
  ErrorContext,
  NetworkErrorType,
  TimeoutErrorType,
  HttpErrorType,
  ParseErrorType,
} from "./types";

// Token resource exports
export type {
  TokenRequest,
  TokenResponse,
  TokenConfig,
} from "./resources/token/types";

// Patient resource exports
export type { PatientListParams, PatientConfig } from "./resources/patients";

export type { Patient, PatientListResponse } from "./resources/patients/types";

// Error exports
export {
  HttpClientError,
  NetworkError,
  TimeoutError,
  HttpError,
  ParseError,
  ApiError,
} from "./errors";

// Utility exports
export {
  normalizeResponse,
  buildUrl,
  mergeHeaders,
  getContentType,
  serializeBody,
  parseResponseData,
  isSuccess,
  isError,
} from "./utils";

// Default export - Main Prescribery client for convenience
export { Prescribery as default } from "./prescribery";
