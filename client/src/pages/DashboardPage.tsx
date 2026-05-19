import { useActionData, useLoaderData } from 'react-router';
import { PageScaffold } from './PageScaffold';
import {
  createPlaceholderAction,
  requireAuthenticatedLoader,
} from '../session';

export async function loader() {
  return requireAuthenticatedLoader({
    recentLogEntries: ['ingest | Example Article', 'lint | Workspace check'],
    route: 'Dashboard',
    stats: {
      contradictions: 0,
      orphanPages: 0,
      pages: 0,
      sources: 0,
    },
  });
}

export const action = createPlaceholderAction('start-ingest');

export default function DashboardPage() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <PageScaffold
      actionData={actionData}
      fields={[
        { defaultValue: 'start-ingest', label: 'Intent', name: 'intent' },
        { defaultValue: 'single', label: 'Mode', name: 'mode' },
      ]}
      loaderData={loaderData}
      route="/"
      submitLabel="Run dashboard action"
      summary="Workspace summary, recent log entries, ingest queue, and wiki health metrics."
      title="Dashboard"
    />
  );
}
