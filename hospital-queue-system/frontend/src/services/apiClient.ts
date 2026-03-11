export type ApiError = {
  success: false;
  message: string;
  details?: unknown;
};

const rawBase = (import.meta as any).env?.VITE_API_URL;
const API_BASE = typeof rawBase === 'string' && rawBase.trim() ? rawBase.trim() : 'http://127.0.0.1:4000';

export async function apiRequest<T>(
  path: string,
  opts?: {
    method?: string;
    body?: unknown;
    token?: string;
  },
): Promise<T> {
  let res: Response;
  try {
    const controller = new AbortController();
    const timeoutMs = 15_000;
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    res = await fetch(`${API_BASE}${path}`, {
      method: opts?.method ?? 'GET',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        ...(opts?.token ? { authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts?.body ? JSON.stringify(opts.body) : undefined,
    });

    window.clearTimeout(timeoutId);
  } catch (e: any) {
    const name = String(e?.name ?? '');
    const isAbort = name === 'AbortError';
    const err: ApiError = {
      success: false,
      message: isAbort
        ? 'Request timed out. Please check your connection and try again.'
        : `Cannot reach backend. Make sure backend is running (http://127.0.0.1:4000/health).`,
    };
    throw err;
  }

  const text = await res.text();
  let json: any = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    const message =
      json?.message ??
      (text && text.length < 300 ? text : null) ??
      `Request failed (${res.status})`;
    const err: ApiError = { success: false, message, details: json?.details };
    throw err;
  }

  if (json) {
    return (json?.data ?? json) as T;
  }

  return text as unknown as T;
}
