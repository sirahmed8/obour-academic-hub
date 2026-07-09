"use client";

import { auth } from "@/lib/firebase";
import { getApiBaseUrl } from "@/lib/config";
import { errorLogger } from "@/lib/errorLogger";

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data: unknown = null
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: BodyInit | FormData | Record<string, unknown> | null;
};

async function createHeaders(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers);

  if (!auth) return nextHeaders;

  try {
    // Wait for auth to initialize if it hasn't yet
    // Firebase auth.currentUser can be null during initial load
    let currentUser = auth.currentUser;

    if (!currentUser) {
      // Small helper to wait for auth state
      currentUser = await new Promise((resolve) => {
        const unsubscribe = auth!.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user);
        });
        // Timeout after 2 seconds to avoid hanging
        setTimeout(() => {
          unsubscribe();
          resolve(null);
        }, 2000);
      });
    }

    if (currentUser && !nextHeaders.has("Authorization")) {
      const token = await currentUser.getIdToken();
      nextHeaders.set("Authorization", `Bearer ${token}`);
    }
  } catch (error) {
    errorLogger.log("[API Client] Failed to attach auth token", "warning", { error });
  }

  return nextHeaders;
}

export async function apiFetch<T>(
  path: string,
  init: ApiRequestInit = {},
  retries = 3,
  backoffIndex = 1
): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  try {
    const headers = await createHeaders(init.headers);
    let body = init.body;

    if (body && !(body instanceof FormData) && typeof body !== "string") {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(body);
    }

    const response = await fetch(url, {
      ...init,
      headers,
      body: (body as BodyInit) ?? undefined,
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let payload: unknown = null;
    if (isJson) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      // Retry logic for specific status codes
      const retryableStatuses = [408, 429, 500, 502, 503, 504];
      if (retryableStatuses.includes(response.status) && retries > 0) {
        const delay = 1000 * Math.pow(2, backoffIndex - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiFetch<T>(path, init, retries - 1, backoffIndex + 1);
      }

      const errorData = payload as Record<string, unknown> | null;
      const errorMessage =
        (errorData && typeof errorData.error === "string" ? errorData.error : null) ||
        (errorData && typeof errorData.message === "string" ? errorData.message : null) ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, payload);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    // Handle network errors or other fetch-related issues
    if (retries > 0) {
      const delay = 1000 * Math.pow(2, backoffIndex - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiFetch<T>(path, init, retries - 1, backoffIndex + 1);
    }

    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected network error occurred",
      0,
      error
    );
  }
}
