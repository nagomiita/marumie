/**
 * Custom fetch wrapper for Orval-generated API client
 * Adds base URL and error handling
 */

// API Base URL - 開発環境ではlocalhost、本番環境では環境変数で上書き可能
const getApiBaseUrl = (): string => {
  return "http://localhost:8000";
};

export const customFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const fullUrl = `${getApiBaseUrl()}${url}`;

  // FormDataの場合はContent-Typeを自動設定させる（boundary含む）
  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  // FormDataでない場合のみContent-Typeを設定
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(fullUrl, {
    ...options,
    headers,
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
