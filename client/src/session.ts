import type { ActionFunctionArgs } from 'react-router';

export type PlaceholderActionData = {
  fields: Record<string, string>;
  intent: string;
  ok: true;
  submittedAt: string;
};

export function requireAuthenticatedLoader<T>(data: T): T {
  return data;
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

export function notFoundResponse(recordName: string) {
  return new Response(`${recordName} not found`, {
    status: 404,
    statusText: 'Not Found',
  });
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
