import { describe, it, expect, beforeEach, vi } from "vitest";
import { customFetch } from "@/client/api/custom-fetch";

// グローバルfetchをモック
global.fetch = vi.fn();

describe("customFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add base URL to the request", async () => {
    const mockResponse = { data: "test" };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await customFetch("/api/test");

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/test",
      expect.any(Object),
    );
  });

  it("should set Content-Type header for non-FormData requests", async () => {
    const mockResponse = { data: "test" };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await customFetch("/api/test", {
      method: "POST",
      body: JSON.stringify({ key: "value" }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  it("should not set Content-Type for FormData requests", async () => {
    const mockResponse = { data: "test" };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const formData = new FormData();
    formData.append("file", "test");

    await customFetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const callArgs = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(callArgs.headers["Content-Type"]).toBeUndefined();
  });

  it("should throw error when response is not ok", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () => "Error message",
    });

    await expect(customFetch("/api/test")).rejects.toThrow();
  });

  it("should parse JSON response", async () => {
    const mockData = { id: 1, name: "Test" };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => mockData,
    });

    const result = await customFetch<{ data: typeof mockData; status: number; headers: Headers }>("/api/test");

    expect(result.data).toEqual(mockData);
    expect(result.status).toBe(200);
  });
});
