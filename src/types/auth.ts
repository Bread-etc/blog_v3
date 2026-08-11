interface AuthUser {
  id: string
  username: string
  role: string
}

// ===== 导出接口类型 =====

export interface PublicKeyResponse {
  publicKey: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

export interface ProfileResponse {
  id: string
  username: string
  role: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {}
