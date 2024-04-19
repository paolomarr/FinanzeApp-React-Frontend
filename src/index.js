import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

/* The following line can be included in your src/index.js or App.js file */
import './App.scss';

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { languages } from './constants/index.js';

// Detect the user's preferred language
const userLanguages = navigator.languages;
const preferredLanguage = userLanguages[0]; // Get the first language in the array

// Extract the language part (e.g., "en" from "en-GB")
const preferredLocale = preferredLanguage.split('-')[0];
const storedLocale = localStorage.getItem("user_locale");
let locales = {};
languages.map((lang) => {
  const locale = lang.locale;
  const messages = lang.messages;
  locales[locale] = messages;
})
i18n.load(locales);
let initialLocale = "en";
if(storedLocale){
  initialLocale = storedLocale;
}else if(preferredLocale in locales){
  initialLocale = preferredLocale;
}
i18n.activate(initialLocale);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
