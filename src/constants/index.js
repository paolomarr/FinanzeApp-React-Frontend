import { messages } from "../locales/en/messages.js";
import { messages as itMessages } from "../locales/it/messages.js";

export const languages = [
  {locale: "en", name: "English", messages: messages,},
  {locale: "it", name: "Italiano", messages: itMessages},
];

export const API_URL = new URL(process.env.REACT_APP_BACKEND_API_BASE);

const generateURLAppendingPath = (path) => {
  if (!path) {
    return API_URL;
  }
  const origin = API_URL.origin;
  const basepath = API_URL.pathname.replace(/\/$/, ''); // starts with a slash
  const finalpath = `${basepath}/${path.replace(/^\//, '')}`; // remove leading slash from path, if any
  const url = new URL(finalpath, origin);
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
