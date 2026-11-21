import { vi } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { MemoryRouter } from "react-router-dom";
import { messages } from "../locales/en/messages.mjs";
import UserContext from "../contexts/UserContext";

i18n.load({ en: messages });
i18n.activate("en");

// Renders `ui` with the providers the app sets up in index.js / App.jsx.
export const renderWithProviders = (ui, { user = null } = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <I18nProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={[user, () => {}]}>
          <MemoryRouter>{ui}</MemoryRouter>
        </UserContext.Provider>
      </QueryClientProvider>
    </I18nProvider>
  );
};

// Stubs global fetch so /api/instance/ returns `info` (or fails if null).
export const mockInstance = (info) => {
  globalThis.fetch = vi.fn(async (url) => {
    if (String(url).endsWith("/instance/") && info) {
      return { ok: true, json: async () => info };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  });
};
