import { API_BASE_URL } from './constants';
import { getStoredRole, getStoredUser, getStoredToken, clearStoredAuth } from './auth';

export interface ApiOptions extends RequestInit {
  role?: string;
  userId?: string;
  token?: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { role, userId, token, headers, ...customConfig } = options;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Determine active auth credentials from parameters or storage
  const activeRole = role || getStoredRole() || 'admin';
  const activeUser = getStoredUser();
  const activeUserId = userId || activeUser?.user_id || activeUser?.id || 'usr_admin_01';
  const activeToken = token || getStoredToken();

  defaultHeaders['X-User-Role'] = activeRole;
  defaultHeaders['X-User-Id'] = activeUserId;

  if (activeToken) {
    defaultHeaders['Authorization'] = `Bearer ${activeToken}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    method: customConfig.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...customConfig,
  };

  try {
    const response = await fetch(url, config);

    let data: unknown = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        if (typeof window !== 'undefined') {
          clearStoredAuth();
        }
        const parsed = data as { detail?: string } | null;
        throw new ApiError(parsed?.detail || 'Authentication session expired. Please sign in again.', 401, data);
      }

      // Handle 403 Forbidden
      if (response.status === 403) {
        const parsed = data as { detail?: string } | null;
        throw new ApiError(parsed?.detail || 'Access Denied: You do not have permission for this resource.', 403, data);
      }

      // Handle 422 Unprocessable Entity / Validation Errors
      if (response.status === 422) {
        const parsed = data as { detail?: string | Array<{ msg: string; loc?: string[] }> } | null;
        let msg = 'Validation error.';
        if (typeof parsed?.detail === 'string') {
          msg = parsed.detail;
        } else if (Array.isArray(parsed?.detail)) {
          msg = parsed.detail.map((err) => err.msg).join(', ');
        }
        throw new ApiError(msg, 422, data);
      }

      // General error formatting without raw stack trace exposure
      const parsedData = data as { detail?: string | object } | null;
      const errorMessage = typeof parsedData === 'object' && parsedData?.detail
        ? (typeof parsedData.detail === 'string' ? parsedData.detail : JSON.stringify(parsedData.detail))
        : response.statusText || 'An unexpected backend error occurred.';

      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError((error as Error).message || 'Network communication error.', 500);
  }
}

export const api = {
  get: <T>(endpoint: string, options?: ApiOptions) => fetchApi<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    fetchApi<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    }),
  put: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body?: unknown, options?: ApiOptions) =>
    fetchApi<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string, options?: ApiOptions) => fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};
