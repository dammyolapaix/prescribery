import https from "node:https";
import { IncomingMessage } from "node:http";
import { buildUrl, ENVIRONMENTS } from "../../utils";
import type { TokenRequest, TokenResponse, TokenConfig } from "./types";

/**
 * Token resource for authentication
 *
 * Handles API key to access token exchange with proper error handling
 * and debug logging capabilities.
 *
 * @example
 * ```typescript
 * const tokenResource = new TokenResource({
 *   apiKey: 'your-api-key',
 *   environment: 'production',
 *   debug: true
 * })
 *
 * const tokenResponse = await tokenResource.accessToken()
 * console.log('Access token:', tokenResponse.access_token)
 * ```
 */
export class TokenResource {
  private readonly config: TokenConfig;

  constructor(config: TokenConfig) {
    this.config = config;
  }

  /**
   * Generate a new access token using the API key
   *
   * @returns Promise resolving to token response
   * @throws {Error} If authentication fails or network error occurs
   *
   * @example
   * ```typescript
   * const tokenResponse = await tokenResource.accessToken()
   * console.log('Access token:', tokenResponse.access_token)
   * ```
   */
  async accessToken(): Promise<TokenResponse> {
    const requestBody: TokenRequest = {
      api_key: this.config.apiKey,
    };

    // Access token endpoint has a different response format
    // We need to handle it specially without normalization
    const baseURL = ENVIRONMENTS[this.config.environment];
    const url = buildUrl(baseURL, "/access-token");
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Log the request if debug is enabled
    if (this.config.debug) {
      console.log("🌐 HTTP Request (curl equivalent):");
      console.log(`curl -X 'POST' \\`);
      console.log(`  '${url}' \\`);
      console.log(`  -H 'Content-Type: application/json' \\`);
      console.log(`  -H 'Accept: application/json' \\`);
      console.log(`  -d '${JSON.stringify(requestBody)}'`);
      console.log("");
    }

    return new Promise<TokenResponse>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        req.destroy();
        reject(new Error(`Request timeout after 30000ms`));
      }, 30000);

      const req = https.request(
        url,
        {
          method: "POST",
          headers,
        },
        (res: IncomingMessage) => {
          clearTimeout(timeoutId);
          let data = "";
          res.on("data", (chunk: unknown) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const parsedData = JSON.parse(data);

              // Log response if debug is enabled
              if (this.config.debug) {
                console.log("📥 HTTP Response:");
                console.log(`Status: ${res.statusCode}`);
                console.log("Body:", data);
                console.log("");
              }

              // Handle success response (direct token object)
              if (res.statusCode === 200 && parsedData.access_token) {
                resolve(parsedData as TokenResponse);
              } else {
                // Handle error response (simple message object)
                const errorMessage = parsedData.message || "Unknown error";
                reject(
                  new Error(`Failed to generate access token: ${errorMessage}`)
                );
              }
            } catch (error) {
              reject(
                new Error(
                  `Failed to parse response: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`
                )
              );
            }
          });
        }
      );

      req.on("error", (error: Error) => {
        clearTimeout(timeoutId);
        reject(new Error(`Network error: ${error.message}`));
      });

      req.on("timeout", () => {
        clearTimeout(timeoutId);
        req.destroy();
        reject(new Error(`Request timeout after 30000ms`));
      });

      req.write(JSON.stringify(requestBody));
      req.end();
    });
  }
}

// Export types for external use
export type { TokenRequest, TokenResponse, TokenConfig };
