import axios from "axios"
import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios"
import { toast } from "sonner"

import { env } from "@/config/env"
import i18n from "@/i18n"
import { queryClient } from "@/lib/query-client"
import { useUserStore } from "@/store/userStore"
import type { ResponseEnvelope } from "@/types/common"

export class HttpError extends Error {
  status: number
  code: number
  errorCode: string

  constructor(message: string, status = 0, code = 0, errorCode = "") {
    super(message)
    this.name = "HttpError"
    this.status = status
    this.code = code
    this.errorCode = errorCode
  }
}

const instance: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useUserStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

instance.interceptors.response.use(
  (response) => {
    const result = response.data

    if (result.code !== 200) {
      throw new HttpError(
        result.message,
        response.status,
        result.code,
        result.errorCode
      )
    }

    return result.data
  },
  (error: AxiosError<ResponseEnvelope<unknown>>) => {
    if (!error.response) {
      return Promise.reject(new HttpError("Network error", 0, 0))
    }

    const status = error.response.status
    const code = error.response.data?.code ?? status
    const errorCode = error.response.data?.errorCode ?? ""
    const message =
      error.response.data?.message ?? error.message ?? "Request failed"

    const userStore = useUserStore.getState()

    if (status === 401 && errorCode === "UNAUTHORIZED" && userStore.token) {
      toast.error(i18n.t("auth.login.sessionExpired"), {
        id: "session-expired",
      })
      queryClient.removeQueries()
      userStore.logout()
    }

    return Promise.reject(new HttpError(message, status, code, errorCode))
  }
)

export const http = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get<ResponseEnvelope<T>, T>(url, config)
  },

  post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return instance.post<ResponseEnvelope<T>, T>(url, data, config)
  },

  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.put<ResponseEnvelope<T>, T>(url, data, config)
  },

  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete<ResponseEnvelope<T>, T>(url, config)
  },
}

export default instance
