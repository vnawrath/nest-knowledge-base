import { redirect, type ActionFunctionArgs } from 'react-router';

const SESSION_STORAGE_KEY = 'llm-wiki.session';

export type Session = {
  authenticated: boolean;
  email: string | null;
};

export type RootLoaderData = {
  session: Session;
};

export type PlaceholderActionData = {
  fields: Record<string, string>;
  intent: string;
  ok: true;
  submittedAt: string;
};

export function getSession(): Session {
  if (typeof sessionStorage === 'undefined') {
    return { authenticated: false, email: null };
  }

  const email = sessionStorage.getItem(SESSION_STORAGE_KEY);
  return {
    authenticated: email !== null,
    email,
  };
}

export function setSession(email: string): void {
  sessionStorage.setItem(SESSION_STORAGE_KEY, email);
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

export function rootLoader(): RootLoaderData {
  return { session: getSession() };
}

export function loginLoader(): RootLoaderData | Response {
  const session = getSession();
  if (session.authenticated) {
    return redirect('/');
  }

  return { session };
}

export function requireAuthenticatedLoader<T>(
  data: T,
): (T & RootLoaderData) | Response {
  const session = getSession();
  if (!session.authenticated) {
    return redirect('/login');
  }

  return {
    ...data,
    session,
  };
}

export function assertPlaceholderRecord(
  recordId: string | undefined,
  recordName: string,
): string {
  if (!recordId || recordId === 'missing') {
    throw new Response(`${recordName} not found`, {
      status: 404,
      statusText: 'Not Found',
    });
  }

  return recordId;
}

export function createPlaceholderAction(defaultIntent: string) {
  return async ({
    request,
  }: ActionFunctionArgs): Promise<PlaceholderActionData> => {
    const formData = await request.formData();
    const intentEntry = formData.get('intent');
    const fields = Object.fromEntries(
      Array.from(formData.entries(), ([key, value]) => [
        key,
        typeof value === 'string' ? value : value.name,
      ]),
    );

    return {
      fields,
      intent: typeof intentEntry === 'string' ? intentEntry : defaultIntent,
      ok: true,
      submittedAt: new Date().toISOString(),
    };
  };
}

export async function loginAction({ request }: ActionFunctionArgs) {
  const currentSession = getSession();
  const formData = await request.formData();
  const intentEntry = formData.get('intent');
  const emailEntry = formData.get('email');
  const passwordEntry = formData.get('password');
  const intent = typeof intentEntry === 'string' ? intentEntry : 'sign-in';

  if (intent === 'sign-out') {
    clearSession();
    return redirect('/login');
  }

  if (currentSession.authenticated) {
    throw new Response('Already authenticated', {
      status: 409,
      statusText: 'Conflict',
    });
  }

  const email = typeof emailEntry === 'string' ? emailEntry.trim() : '';
  const password =
    typeof passwordEntry === 'string' ? passwordEntry.trim() : '';

  if (!email || !password) {
    throw new Response('Invalid credentials', {
      status: 400,
      statusText: 'Bad Request',
    });
  }

  if (email === 'rate-limited@example.com') {
    throw new Response('Too Many Requests', {
      status: 429,
      statusText: 'Too Many Requests',
    });
  }

  setSession(email);
  return redirect('/');
}
