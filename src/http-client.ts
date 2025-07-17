import https from "node:https";
import type {
  HttpMethod,
  HttpsClientConfig,
  RequestOptions,
  PrescriberyResponse,
} from "./types";
import { NetworkError, TimeoutError, ParseError } from "./errors";
import {
  buildUrl,
  mergeHeaders,
  getContentType,
  serializeBody,
  parseResponseData,
  normalizeResponse,
} from "./utils";

/** Default configuration values for the HTTPS client */
const DEFAULT_CONFIG: Required<HttpsClientConfig> = {
  baseURL: "",
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};

/**
 * Log curl-equivalent command for debugging
 */
function logCurlRequest(
  method: HttpMethod,
  url: string,
  headers: Record<string, string>,
  body?: string | Buffer
): void {
  console.log("🌐 HTTP Request (curl equivalent):");

  // Start with curl command
  let curlCommand = `curl -X '${method}' \\`;

  // Add URL on new line
  curlCommand += `\n  '${url}' \\`;

  // Add headers (only essential ones for readability)
  const essentialHeaders = ["accept", "content-type", "authorization"];
  Object.entries(headers)
    .filter(([key]) => essentialHeaders.includes(key.toLowerCase()))
    .forEach(([key, value]) => {
      curlCommand += `\n  -H '${key}: ${value}' \\`;
    });

  // Add body if present
  if (body && method !== "GET") {
    if (typeof body === "string") {
      curlCommand += `\n  -d '${body.replace(/'/g, "\\'")}'`;
    } else {
      curlCommand += `\n  --data-binary @-`;
    }
  }

  console.log(curlCommand);
  console.log("");
}

/**
 * Serialize FormData to multipart form data
 */
async function serializeFormData(formData: FormData): Promise<{
  data: Buffer;
  boundary: string;
}> {
  const boundary = `----prescribery-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  const chunks: Buffer[] = [];

  for (const [key, value] of formData.entries()) {
    chunks.push(Buffer.from(`--${boundary}\r\n`));

    if (value instanceof File) {
      chunks.push(
        Buffer.from(
          `Content-Disposition: form-data; name="${key}"; filename="${value.name}"\r\n`
        )
      );
      chunks.push(
        Buffer.from(
          `Content-Type: ${value.type || "application/octet-stream"}\r\n\r\n`
        )
      );
      chunks.push(Buffer.from(await value.arrayBuffer()));
    } else {
      chunks.push(
        Buffer.from(`Content-Disposition: form-data; name="${key}"\r\n\r\n`)
      );
      chunks.push(Buffer.from(String(value)));
    }

    chunks.push(Buffer.from("\r\n"));
  }

  chunks.push(Buffer.from(`--${boundary}--\r\n`));

  return {
    data: Buffer.concat(chunks),
    boundary,
  };
}

/**
 * Internal HTTPS client for making HTTP requests
 * Zero-dependency implementation using Node.js built-ins
 */
export class HttpsClient {
  /** Merged configuration with defaults applied */
  private readonly config: Required<HttpsClientConfig>;
  /** Whether to log requests */
  private readonly debug: boolean;

  constructor(config: HttpsClientConfig & { debug?: boolean }) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      headers: mergeHeaders(DEFAULT_CONFIG.headers, config.headers),
    };
    this.debug = config.debug || false;

    // Debug logging to see what baseURL is being used
    if (this.debug) {
      console.log("🔧 HTTP Client Config:", {
        baseURL: this.config.baseURL,
        timeout: this.config.timeout,
        headers: this.config.headers,
      });
    }
  }

  /**
   * Performs a GET request
   */
  async get<T>(
    path: string,
    options: RequestOptions
  ): Promise<PrescriberyResponse<T>> {
    return this.request<T>("GET", path, options);
  }

  /**
   * Performs a POST request
   */
  async post<T>(
    path: string,
    options: RequestOptions
  ): Promise<PrescriberyResponse<T>> {
    return this.request<T>("POST", path, options);
  }

  /**
   * Performs a PUT request
   */
  async put<T>(
    path: string,
    options: RequestOptions
  ): Promise<PrescriberyResponse<T>> {
    return this.request<T>("PUT", path, options);
  }

  /**
   * Performs a DELETE request
   */
  async delete<T>(
    path: string,
    options: RequestOptions
  ): Promise<PrescriberyResponse<T>> {
    return this.request<T>("DELETE", path, options);
  }

  /**
   * Performs a PATCH request
   */
  async patch<T>(
    path: string,
    options: RequestOptions
  ): Promise<PrescriberyResponse<T>> {
    return this.request<T>("PATCH", path, options);
  }

  /**
   * Internal method that performs the actual HTTP request
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    options: RequestOptions
  ): Promise<PrescriberyResponse<T>> {
    const url = buildUrl(this.config.baseURL, path, options.query);
    const headers = mergeHeaders(this.config.headers, options.headers, {
      Authorization: `Bearer ${options.accessToken}`,
    });

    let requestBody: string | Buffer = "";
    let contentType = "";

    if (options.body && method !== "GET") {
      if (options.body instanceof FormData) {
        // Handle FormData specially
        const { data, boundary } = await serializeFormData(options.body);
        requestBody = data;
        contentType = `multipart/form-data; boundary=${boundary}`;
      } else {
        // Handle other body types
        requestBody = serializeBody(options.body);
        contentType = getContentType(options.body);
      }

      headers["Content-Type"] = contentType;
      headers["Content-Length"] = Buffer.byteLength(requestBody).toString();
    }

    // Log the request if debug is enabled
    if (this.debug) {
      logCurlRequest(method, url, headers, requestBody);
    }

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        req.destroy();
        reject(
          new TimeoutError(`Request timeout after ${this.config.timeout}ms`, {
            method,
            url,
          })
        );
      }, this.config.timeout);

      const req = https.request(
        url,
        {
          method,
          headers,
        },
        (res) => {
          clearTimeout(timeoutId);

          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const responseContentType =
                res.headers["content-type"] || "application/json";
              const parsedData = parseResponseData(data, responseContentType);
              const normalizedResponse = normalizeResponse<T>(parsedData);

              // Log response if debug is enabled
              if (this.debug) {
                console.log("📥 HTTP Response:");
                console.log(`Status: ${res.statusCode}`);
                console.log("Headers:", JSON.stringify(res.headers, null, 2));
                console.log("Body:", data);
                console.log("");
              }

              resolve(normalizedResponse);
            } catch (error) {
              reject(
                new ParseError(
                  `Failed to parse response: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                  { method, url },
                  error instanceof Error ? error : undefined
                )
              );
            }
          });
        }
      );

      req.on("error", (error) => {
        clearTimeout(timeoutId);
        reject(
          new NetworkError(
            `Network error: ${error.message}`,
            { method, url },
            "CONNECTION"
          )
        );
      });

      req.on("timeout", () => {
        clearTimeout(timeoutId);
        req.destroy();
        reject(
          new TimeoutError(`Request timeout after ${this.config.timeout}ms`, {
            method,
            url,
          })
        );
      });

      if (requestBody) {
        req.write(requestBody);
      }

      req.end();
    });
  }
}
