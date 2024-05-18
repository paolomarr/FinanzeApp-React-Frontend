import { messages } from "../locales/en/messages.js";
import { messages as itMessages } from "../locales/it/messages.js";

export const languages = [
  {locale: "en", name: "English", messages: messages,},
  {locale: "it", name: "Italiano", messages: itMessages},
];
export const API_URL = process.env.REACT_APP_API_URL;

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
