import { messages } from "../locales/en/messages.mjs";
import { messages as itMessages } from "../locales/it/messages.mjs";


export const languages = [
  {locale: "en", name: "English", messages: messages,},
  {locale: "it", name: "Italiano", messages: itMessages},
];

export const API_URL_STRING = import.meta.env.VITE_BACKEND_API_BASE;

// The API base may be absolute ("http://localhost:8003/api/") or relative to
// the page ("/api/", used when frontend and API share one origin, as in the
// demo instance): relative bases are resolved against the page's origin.
export const generateURLAppendingPath = (path, base = API_URL_STRING) => {
  const pageOrigin = window.location.origin;
  if (!path) {
    return new URL(base, pageOrigin);
  }
  const origin = base.replace(/\/$/, ''); // remove trailing slash if any
  const noLeadingSlashPath = path.replace(/^\//, ''); // remove leading slash from path, if any
  const finalpath = `${origin}/${noLeadingSlashPath}`;
  return new URL(finalpath, pageOrigin);
}
export const API_ENDPOINTS = {
  movements: () => generateURLAppendingPath("movements"),
  tradinglog: () => generateURLAppendingPath("tradinglog"),
  tokenauth: () => generateURLAppendingPath("api-token-auth/"),
  tokenlogout: () => generateURLAppendingPath("api-token-logout/"),
  scanreceipt: () => generateURLAppendingPath("scan-receipt"),
  instance: () => generateURLAppendingPath("instance/"),
  voice: () => generateURLAppendingPath("voice/voice/"), // trailing slash is important as django backend expects it when POSTing
}

export const colors = {
  primary: "#66c2a5",
  secondary: "#666",
  secondary_300: "#333",
  error: "#fc8d62",
  secondary_800: "#888",
  secondary_A00: "#AAA",
};

export const ENVIRONMENT = import.meta.env.NODE_ENV
export const isDevelopment = () => ENVIRONMENT === 'development';
export const debuglog = (message) => {
  if(isDevelopment()){
    console.log(`[DEBUG] ${message}`);
  }
}