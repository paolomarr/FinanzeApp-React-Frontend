import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

/* The following line can be included in your src/index.js or App.js file */
import './App.scss';

import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { languages } from './constants/index.js';
import App from "./App.jsx"
import Home from "./components/Home.jsx"
import AssetsManager from './components/Assets.jsx';
import LoginForm from './components/LoginForm.jsx';
import Trading from './components/Trading.jsx';
import Settings from './components/Settings.jsx';
import { t } from '@lingui/macro';
import CategoryManager from './components/CategoryManager.jsx';

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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element=<Home /> handle={{ title: () => t`Movements overview`}}/>
      <Route path="/assets" element=<AssetsManager /> handle={{ title: () => t`Balance records`}}/>
      <Route path="/login" element=<LoginForm /> handle={{ title: () => t`Login`}}/>
      <Route path="/logout" element=<LoginForm logout={true}/> handle={{ title: () => t`Login`}}/>
      <Route path="/trading" element=<Trading /> handle={{ title: () => t`Trading`}}/>
      <Route path="/settings" element=<Settings />handle={{ title: () => t`Settings`}}>
        <Route path='categories' element=<CategoryManager /> />
      </Route>
    </Route>
  )
);


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
