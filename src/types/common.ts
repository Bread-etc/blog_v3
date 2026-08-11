export interface ResponseEnvelope<T> {
  code: number
  errorCode: string
  message: string
  data: T
}
