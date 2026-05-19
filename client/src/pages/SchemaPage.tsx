import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    lastModified: '2026-01-01T00:00:00.000Z',
    route: 'Schema',
    validationState: 'valid',
  });
}

export const action = createPlaceholderAction('save-schema');

export default function SchemaPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'save-schema', label: 'Intent', name: 'intent' },
        { defaultValue: 'AGENTS.md', label: 'Schema file', name: 'schemaFile' },
      ]}
      loaderData={loaderData}
      route="/schema"
      submitLabel="Submit schema action"
      summary="Schema document scaffold for AGENTS.md editing, switching conventions, and restore flows."
      title="Schema"
    />
  );
}
