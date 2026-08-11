import type { resources } from "./locales/index"

type TranslationScheme = (typeof resources)["zh-CN"]["translation"]

type DotNestedKeys<T> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${DotNestedKeys<T[K]>}`
    : K
}[keyof T & string]

export type I18nKey = DotNestedKeys<TranslationScheme>
