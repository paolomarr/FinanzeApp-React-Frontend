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
  secondary_800: this.grayFunc(10.0/16),
  error: "#fc8d62",
  grayFunc: (level) => {
    const outlevel = Math.round(Math.min(Math.max(0, level), 1) * 16).toString(16);
    return `#${outlevel}${outlevel}${outlevel}`;
  }
};
