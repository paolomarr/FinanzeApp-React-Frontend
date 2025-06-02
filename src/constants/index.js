import { messages } from "../locales/en/messages.js";
import { messages as itMessages } from "../locales/it/messages.js";

export const languages = [
  {locale: "en", name: "English", messages: messages,},
  {locale: "it", name: "Italiano", messages: itMessages},
];

export const API_URL_STRING = process.env.REACT_APP_BACKEND_API_BASE;

const generateURLAppendingPath = (path) => {
  if (!path) {
    return new URL(API_URL_STRING);
  }
  const origin = API_URL_STRING.replace(/\/$/, ''); // remove trailing slash if any
  const noLeadingSlashPath = path.replace(/^\//, ''); // remove leading slash from path, if any
  const finalpath = `${origin}/${noLeadingSlashPath}`;
  const url = new URL(finalpath);
  return url;
}
export const API_ENDPOINTS = {
  movements: () => generateURLAppendingPath("movements"),
  tradinglog: () => generateURLAppendingPath("tradinglog"),
  tokenauth: () => generateURLAppendingPath("api-token-auth/"),
  scanreceipt: () => generateURLAppendingPath("scan-receipt"),
}

export const colors = {
  primary: "#66c2a5",
  secondary: "#666",
  secondary_300: "#333",
  error: "#fc8d62",
  secondary_800: "#888",
  secondary_A00: "#AAA",
};

export const ENVIRONMENT = process.env.NODE_ENV
export const isDevelopment = () => ENVIRONMENT === 'development';
export const debuglog = (message) => {
  if(isDevelopment()){
    console.log(`[DEBUG] ${message}`);
  }
}
