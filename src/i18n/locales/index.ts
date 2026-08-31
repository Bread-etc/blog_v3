import aboutEn from "./en/about"
import authEn from "./en/auth"
import commonEn from "./en/common"
import errorEn from "./en/error"
import homeEn from "./en/home"
import linksEn from "./en/links"
import navEn from "./en/nav"
import postEn from "./en/post"
import aboutZh from "./zh/about"
import authZh from "./zh/auth"
import commonZh from "./zh/common"
import errorZh from "./zh/error"
import homeZh from "./zh/home"
import linksZh from "./zh/links"
import navZh from "./zh/nav"
import postZh from "./zh/post"

export const resources = {
  en: {
    translation: {
      common: commonEn,
      nav: navEn,
      error: errorEn,
      auth: authEn,
      home: homeEn,
      links: linksEn,
      about: aboutEn,
      post: postEn,
    },
  },
  "zh-CN": {
    translation: {
      common: commonZh,
      nav: navZh,
      error: errorZh,
      auth: authZh,
      home: homeZh,
      links: linksZh,
      about: aboutZh,
      post: postZh,
    },
  },
} as const
