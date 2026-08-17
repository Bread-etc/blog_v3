import aboutEn from "./en/about"
import authEn from "./en/auth"
import commonEn from "./en/common"
import errorEn from "./en/error"
import linksEn from "./en/links"
import navEn from "./en/nav"
import aboutZh from "./zh/about"
import authZh from "./zh/auth"
import commonZh from "./zh/common"
import errorZh from "./zh/error"
import linksZh from "./zh/links"
import navZh from "./zh/nav"

export const resources = {
  en: {
    translation: {
      common: commonEn,
      nav: navEn,
      error: errorEn,
      auth: authEn,
      links: linksEn,
      about: aboutEn,
    },
  },
  "zh-CN": {
    translation: {
      common: commonZh,
      nav: navZh,
      error: errorZh,
      auth: authZh,
      links: linksZh,
      about: aboutZh,
    },
  },
} as const
