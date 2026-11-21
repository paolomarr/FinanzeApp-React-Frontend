import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { generateURLAppendingPath } from "../constants";
import { fetchInstance, DEFAULT_INSTANCE_INFO } from "../queries/fetchInstance";
import LoginForm from "../components/LoginForm";
import MainNavbar from "../components/MainNavbar";
import VoiceInsertionModal from "../components/VoiceInsertionModal";
import { mockInstance, renderWithProviders } from "./renderWithProviders";

const DEMO = {
  demo: true,
  features: { voice: false },
  demo_credentials: { username: "demo", password: "demo" },
};
const REGULAR = { demo: false, features: { voice: true } };

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("generateURLAppendingPath", () => {
  it("keeps absolute API bases unchanged", () => {
    expect(generateURLAppendingPath("movements", "http://localhost:8003/api/").href)
      .toBe("http://localhost:8003/api/movements");
  });

  it("resolves relative API bases against the page origin", () => {
    const origin = window.location.origin;
    expect(generateURLAppendingPath("/instance/", "/api/").href).toBe(`${origin}/api/instance/`);
    expect(generateURLAppendingPath(null, "/api/").href).toBe(`${origin}/api/`);
  });
});

describe("fetchInstance", () => {
  it("falls back to a regular instance when the endpoint is missing", async () => {
    mockInstance(null);
    expect(await fetchInstance()).toEqual(DEFAULT_INSTANCE_INFO);
  });

  it("falls back when the request fails", async () => {
    globalThis.fetch = vi.fn(async () => { throw new TypeError("network"); });
    expect(await fetchInstance()).toEqual(DEFAULT_INSTANCE_INFO);
  });

  it("returns the backend's info", async () => {
    mockInstance(DEMO);
    expect(await fetchInstance()).toEqual(DEMO);
  });
});

describe("LoginForm", () => {
  it("shows and prefills the demo credentials on a demo instance", async () => {
    mockInstance(DEMO);
    renderWithProviders(<LoginForm />);
    expect(await screen.findByTestId("demo-login-hint")).toHaveTextContent("Log in as demo with password demo");
    await waitFor(() => expect(screen.getByPlaceholderText("Username")).toHaveValue("demo"));
    expect(screen.getByPlaceholderText("Password")).toHaveValue("demo");
  });

  it("shows no hint on a regular instance", async () => {
    mockInstance(REGULAR);
    renderWithProviders(<LoginForm />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(screen.queryByTestId("demo-login-hint")).toBeNull();
    expect(screen.getByPlaceholderText("Username")).toHaveValue("");
  });
});

describe("MainNavbar", () => {
  it("shows the demo badge only on a demo instance", async () => {
    mockInstance(DEMO);
    renderWithProviders(<MainNavbar />);
    expect(await screen.findByTestId("demo-badge")).toHaveTextContent("Demo");
  });

  it("hides the demo badge on a regular instance", async () => {
    mockInstance(REGULAR);
    renderWithProviders(<MainNavbar />);
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(screen.queryByTestId("demo-badge")).toBeNull();
  });
});

describe("VoiceInsertionModal", () => {
  const renderModal = (onManualInsert = vi.fn()) => renderWithProviders(
    <VoiceInsertionModal show onHide={vi.fn()} onMovementCreated={vi.fn()} onManualInsert={onManualInsert} />);

  it("disables voice with an explanation but keeps manual insertion", async () => {
    mockInstance(DEMO);
    const onManualInsert = vi.fn();
    renderModal(onManualInsert);
    expect(await screen.findByTestId("voice-unavailable")).toHaveTextContent("not available in the demo");
    expect(screen.queryByText("Tap to start recording")).toBeNull();
    fireEvent.click(screen.getByText("Insert manually"));
    expect(onManualInsert).toHaveBeenCalled();
  });

  it("shows the recorder when voice is available", async () => {
    mockInstance(REGULAR);
    renderModal();
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
    expect(screen.getByText("Tap to start recording")).toBeInTheDocument();
    expect(screen.queryByTestId("voice-unavailable")).toBeNull();
  });
});
