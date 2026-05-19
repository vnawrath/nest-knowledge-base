import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    filters: ['ingest', 'query', 'lint'],
    parsedEntries: [],
    route: 'Log',
  });
}

export const action = createPlaceholderAction('filter-log');

export default function LogPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'filter-log', label: 'Intent', name: 'intent' },
        { defaultValue: 'ingest', label: 'Operation', name: 'operation' },
      ]}
      loaderData={loaderData}
      route="/log"
      submitLabel="Submit log action"
      summary="Parsed log.md scaffold with operation, date, and title filtering."
      title="Log"
    />
  );
}
