import { http } from "@/services/http/client"
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  ProfileResponse,
  PublicKeyResponse,
} from "@/types/auth"

const url = "/auth"

export function getPublicKey() {
  return http.get<PublicKeyResponse>(`${url}/public-key`)
}

export function login(payload: LoginRequest) {
  return http.post<LoginResponse>(`${url}/login`, payload)
}

export function getProfile() {
  return http.get<ProfileResponse>(`${url}/profile`)
}

export function changePassword(payload: ChangePasswordRequest) {
  return http.post<ChangePasswordResponse>(`${url}/change-password`, payload)
}
