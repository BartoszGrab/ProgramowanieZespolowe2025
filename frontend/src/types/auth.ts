/**
 * Data transfer object used when sending login credentials to the server.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Data transfer object used for registering a new user account.
 * Includes necessary fields for validation and profile creation.
 */
export interface RegisterRequest {
  email: string;
  password: string;
  /** Used for frontend validation to ensure password accuracy. */
  confirmPassword: string;
  /** The public-facing name chosen by the user. */
  displayName: string;
}

/**
 * The standard response payload received from the API upon successful authentication.
 */
export interface AuthResponse {
  /** Status message or welcome note from the server. */
  message: string;
  /** The JWT (JSON Web Token) used for subsequent authenticated requests. */
  token: string;
  userId: string;
  email: string;
}