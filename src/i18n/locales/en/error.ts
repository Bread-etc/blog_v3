export default {
  "400": {
    title: "Something’s not quite right 🤔",
    description:
      "We couldn’t process your request this time. Please try again.",
  },
  "401": {
    title: "Sign in required 🔐",
    description: "You need to sign in before continuing.",
  },
  "403": {
    title: "Access restricted 🚫",
    description: "You don’t have permission to view this page.",
  },
  "404": {
    title: "Page not found 🧭",
    description:
      "The page you’re looking for doesn’t exist or may have been moved.",
  },
  "405": {
    title: "Action not allowed ✋",
    description:
      "This request method isn’t supported here. Try a different one.",
  },
  "408": {
    title: "Request timed out ⌛️",
    description: "The server took too long to respond. Please try again.",
  },
  "429": {
    title: "Too many requests ⚡",
    description:
      "You’re sending requests too quickly. Please slow down and try again.",
  },
  "500": {
    title: "Something went wrong 💥",
    description: "We ran into an issue. Our team is working on it.",
  },
  "502": {
    title: "Bad gateway 🔌",
    description:
      "There was a problem communicating with the server. Please try again later.",
  },
  "503": {
    title: "Service unavailable 🛠",
    description:
      "The service is temporarily unavailable. Please check back soon.",
  },
  "504": {
    title: "Response took too long 🐢",
    description:
      "The server is taking longer than expected. Try refreshing the page.",
  },
  default: {
    title: "Something unexpected happened 😵",
    description:
      "An unknown error occurred. Please refresh or try again later.",
  },
  back: "Back to previous page",
}
