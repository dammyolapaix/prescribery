/**
 * Request payload for token generation
 */
export type TokenRequest = {
  /** API key for authentication */
  api_key: string;
};

/**
 * Response from the access token endpoint
 */
export type TokenResponse = {
  /** Type of token (always "Bearer") */
  token_type: string;
  /** Token expiration time in seconds */
  expires_in: string;
  /** The actual access token */
  access_token: string;
};

/**
 * Token resource configuration
 */
export type TokenConfig = {
  /** API key for authentication */
  apiKey: string;
  /** Environment setting */
  environment: "production" | "staging";
  /** Debug mode flag */
  debug: boolean;
};
