type TokenResponse = {
  accessToken: string;
  expiresIn: number;
};

let accessToken: string | null = null;
let refreshPromise: Promise<TokenResponse | null> | null = null;
const authFailureListeners = new Set<() => void>();

function storeTokenResponse(tokenResponse: TokenResponse): TokenResponse {
  accessToken = tokenResponse.accessToken;
  return tokenResponse;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken(): void {
  accessToken = null;
}

export function onAuthFailure(listener: () => void): () => void {
  authFailureListeners.add(listener);

  return () => {
    authFailureListeners.delete(listener);
  };
}

function handleAuthFailure(): void {
  clearAccessToken();
  for (const listener of authFailureListeners) {
    listener();
  }

  if (
    typeof window !== 'undefined' &&
    window.location.pathname !== '/login' &&
    window.location.pathname !== '/register'
  ) {
    window.location.assign('/login');
  }
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

async function requestToken(
  path: string,
  body?: Record<string, string>,
): Promise<TokenResponse> {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const fallbackMessage = 'Authentication request failed';
    let message = fallbackMessage;

    try {
      const error = (await response.json()) as { message?: string };
      if (typeof error.message === 'string') {
        message = error.message;
      }
    } catch {
      message = fallbackMessage;
    }

    throw new Error(message);
  }

  return storeTokenResponse(await readJson<TokenResponse>(response));
}

async function readErrorMessage(response: Response, fallbackMessage: string) {
  try {
    const error = (await response.json()) as { message?: string | string[] };
    if (Array.isArray(error.message)) {
      return error.message.join(', ');
    }

    if (typeof error.message === 'string') {
      return error.message;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export function loginRequest(
  email: string,
  password: string,
): Promise<TokenResponse> {
  return requestToken('/api/auth/login', { email, password });
}

export function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<TokenResponse> {
  return requestToken('/api/auth/register', { name, email, password });
}

export async function refreshAccessToken(): Promise<TokenResponse | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      handleAuthFailure();
      return null;
    }

    return storeTokenResponse(await readJson<TokenResponse>(response));
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  allowRefresh = true,
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  if (
    response.status === 401 &&
    allowRefresh &&
    typeof input === 'string' &&
    input !== '/api/auth/refresh'
  ) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      return response;
    }

    return apiFetch(input, init, false);
  }

  if (response.status === 401 && allowRefresh) {
    handleAuthFailure();
  }

  return response;
}

export async function apiFetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(input, init);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, 'Request failed'));
  }

  return readJson<T>(response);
}
