/**
 * Custom fetch wrapper for Orval-generated API client
 * Adds base URL and error handling
 */

const getApiBaseUrl = (): string => {
  return import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8000";
};

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const fullUrl = `${getApiBaseUrl()}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const data = await response.json();

  // Orval expects { data, status, headers } format
  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};

export default customFetch;
