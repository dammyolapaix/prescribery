import type {
  PrescriberyResponse,
  HttpHeaders,
  RequestBody,
  QueryParams,
} from "./types";

/** Environment-specific configuration */
export const ENVIRONMENTS: Record<"production" | "staging", string> = {
  production: "https://staff.prescribery.com/api/dtg/v1/",
  staging: "https://staging.doctalkgo.com/api/dtg/v1/",
};

/**
 * Normalize inconsistent API responses into a consistent format
 */
export function normalizeResponse<T>(data: unknown): PrescriberyResponse<T> {
  // Handle format with "status" field
  if (typeof data === "object" && data !== null && "status" in data) {
    const response = data as {
      status: boolean | "failed";
      message: string;
      data?: T;
    };

    if (response.status === false || response.status === "failed") {
      return {
        code: 1,
        message: response.message,
      };
    }

    return {
      code: 0,
      message: response.message,
      data: response.data,
    };
  }

  // Handle standard response format with "code" field
  if (typeof data === "object" && data !== null && "code" in data) {
    const response = data as {
      code: 0 | 1;
      message: string;
      reason?: { [key: string]: string[] };
    } & T;

    if (response.code === 1) {
      return {
        code: 1,
        message: response.message,
        reason: response.reason,
      };
    }

    // For success (code: 0), extract data by removing code and message
    const { code, message, reason, ...dataFields } = response;
    return {
      code: 0,
      message,
      data: dataFields as T,
      reason,
    };
  }

  // Fallback for unknown format
  return {
    code: 1,
    message: "Unknown response format",
  };
}

/**
 * Build complete URL with query parameters
 */
export function buildUrl(
  baseURL: string,
  path: string,
  query?: QueryParams
): string {
  // Ensure baseURL ends with a slash
  const normalizedBaseURL = baseURL.endsWith("/") ? baseURL : baseURL + "/";
  // Remove leading slash from path
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBaseURL);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Debug logging
  console.log("🔗 URL Construction:", {
    baseURL,
    normalizedBaseURL,
    path,
    normalizedPath,
    finalURL: url.toString(),
  });

  return url.toString();
}

/**
 * Merge multiple header objects
 */
export function mergeHeaders(
  ...headers: (HttpHeaders | undefined)[]
): HttpHeaders {
  const result: HttpHeaders = {};
  headers.forEach((header) => {
    if (header) {
      Object.assign(result, header);
    }
  });
  return result;
}

/**
 * Determine content type from body
 */
export function getContentType(body: RequestBody): string {
  if (typeof body === "string") {
    // Check if it's JSON
    try {
      JSON.parse(body);
      return "application/json";
    } catch {
      return "text/plain";
    }
  }

  if (body instanceof URLSearchParams) {
    return "application/x-www-form-urlencoded";
  }

  if (body instanceof FormData) {
    return "multipart/form-data";
  }

  if (typeof body === "object") {
    return "application/json";
  }

  return "application/json";
}

/**
 * Serialize request body
 */
export function serializeBody(body: RequestBody): string | Buffer {
  if (typeof body === "string") {
    return body;
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  if (body instanceof FormData) {
    // For FormData, we need to return it as-is for the HTTP client to handle
    // The HTTP client will handle the multipart boundary and serialization
    throw new Error(
      "FormData serialization should be handled by the HTTP client"
    );
  }

  if (typeof body === "object") {
    return JSON.stringify(body);
  }

  return JSON.stringify(body);
}

/**
 * Parse response data based on content type
 */
export function parseResponseData(data: string, contentType: string): unknown {
  if (!data) {
    return null;
  }

  // Handle JSON responses
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(data);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON response: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  // Handle text responses
  if (contentType.includes("text/")) {
    return data;
  }

  // Default to string
  return data;
}

/**
 * Helper function to check if response is successful
 */
export function isSuccess<T>(
  response: PrescriberyResponse<T>
): response is PrescriberyResponse<T> & { code: 0; data: T } {
  return response.code === 0;
}

/**
 * Helper function to check if response is an error
 */
export function isError<T>(
  response: PrescriberyResponse<T>
): response is PrescriberyResponse<T> & { code: 1 } {
  return response.code === 1;
}
