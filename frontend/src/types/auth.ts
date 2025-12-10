export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  userId: string;
  email: string;
}