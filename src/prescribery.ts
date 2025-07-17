import { HttpsClient } from "./http-client";
import { ENVIRONMENTS } from "./utils";
import type { PrescriberyConfig } from "./types";

/**
 * Extended configuration for the Prescribery client
 */
type PrescriberyConfigWithDebug = PrescriberyConfig & {
  debug?: boolean;
};

/**
 * Main Prescribery client for API authentication and requests
 *
 * Handles API key to access token exchange and provides domain-specific APIs.
 * Developers manage their own token storage and provide access tokens for each request.
 *
 * @example
 * ```typescript
 * const prescribery = new Prescribery({
 *   apiKey: 'your-api-key',
 *   environment: 'production',
 *   debug: true // Enable request logging
 * })
 *
 * // Generate access token
 * const tokenResponse = await prescribery.token.accessToken()
 *
 * // Use token with other resources
 * console.log('Access token:', tokenResponse.access_token)
 * ```
 */
export class Prescribery {
  /** Internal HTTP client for API requests */
  private readonly client: HttpsClient;
  /** API key for authentication */
  private readonly apiKey: string;
  /** Environment setting */
  private readonly environment: "production" | "staging";
  /** Debug mode flag */
  private readonly debug: boolean;

  /**
   * Creates a new Prescribery client instance
   *
   * @param config - Configuration object
   * @param config.apiKey - Your Prescribery API key
   * @param config.environment - Environment to use ('production' or 'staging')
   * @param config.debug - Enable debug logging (default: false)
   *
   * @example
   * ```typescript
   * const prescribery = new Prescribery({
   *   apiKey: 'your-api-key',
   *   environment: 'production',
   *   debug: true // This will log curl commands
   * })
   * ```
   */
  constructor(config: PrescriberyConfigWithDebug) {
    this.apiKey = config.apiKey;
    this.environment = config.environment;
    this.debug = config.debug || false;

    const baseURL = ENVIRONMENTS[config.environment];
    if (!baseURL) {
      throw new Error(
        `Unknown environment: ${config.environment}. Use 'production' or 'staging'.`
      );
    }

    console.log("baseURL", baseURL);

    // Create HTTP client for API requests
    this.client = new HttpsClient({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
      debug: this.debug,
    });
  }
}
