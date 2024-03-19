import { messages } from "../locales/en/messages.js";
import { messages as itMessages } from "../locales/it/messages.js";

export const languages = [
  {locale: "en", name: "English", messages: messages,},
  {locale: "it", name: "Italiano", messages: itMessages},
];
export const API_URL = process.env.REACT_APP_API_URL;